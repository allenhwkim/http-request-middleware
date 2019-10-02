"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const better_sqlite3_1 = require("./better-sqlite3");
function hasAllPayload(req, payload) {
    const payloads = payload.split(',');
    for (var i = 0; i < payloads.length; i++) {
        var el = payloads[i].trim();
        if (el && typeof req.body[el] === 'undefined') {
            return false;
        }
    }
    return true;
}
function findByUrlMethod(url, method) {
    const sql1 = `
    SELECT * 
    FROM mock_responses 
    WHERE req_url = '${url}' 
      AND (req_method = '${method}' OR req_method IS NULL)
      AND active = 1
    ORDER BY req_url is NULL
    LIMIT 1`;
    return better_sqlite3_1.BetterSqlite3.db.prepare(sql1).get();
}
function delay(ms) {
    return new Promise(resolve => setTimeout(_ => resolve(), ms));
}
async function serveMockResponse(req, res, next) {
    if (req.url === "/" || req.url.startsWith("/developer") || req.url.startsWith("/mock-responses")) {
        next();
        return false;
    }
    const origin = req.headers['origin'];
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    const now = Date.now();
    const row = findByUrlMethod(req.url, req.method);
    if (!row) {
        next();
        return;
    }
    if (req.method === 'OPTIONS') {
        res.end();
        return;
    }
    const delaySec = row.res_delay_sec || 0;
    if (delaySec) {
        console.log(`[mock-responses] Delaying ${delaySec} seconds`);
        await delay(delaySec * 1000);
    }
    if (row.req_payload && !hasAllPayload(req, row.req_payload)) {
        res.statusCode = 422;
        res.write(`payload not matching, ${row.req_payload}`);
        res.end();
        return;
    }
    else if ((row.res_body || '').match(/^file:\/\//)) {
        const filePath = path.join(path.dirname(better_sqlite3_1.BetterSqlite3.dbPath), row.res_body.replace('file://', ''));
        res.setHeader('Content-Type', row.res_content_type);
        res.write(fs.readFileSync(filePath, 'utf8'));
        res.statusCode = row.res_status;
        res.end();
        return;
    }
    else if (row) {
        res.setHeader('Content-Type', row.res_content_type);
        res.write(row.res_body);
        res.statusCode = row.res_status;
        res.end();
        return;
    }
    console.log('Noooooooooooooooooooooo you shouldn\'t see this', row);
}
exports.serveMockResponse = serveMockResponse;
//# sourceMappingURL=mock-response.middleware.js.map