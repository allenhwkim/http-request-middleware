import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { faPlay, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MockResponsesService } from '../mock-responses/mock-responses.service';
import { AuthorizedServiceService } from '../authorized.service';
import { UseCaseDialogComponent } from '../dialogs/use-case-dialog.component';
import { UseCasesService } from '../use-cases/use-cases.service';
import { MockResponseDialogComponent } from '../dialogs/mock-response-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  objectEntries = Object.entries;
  faPlay = faPlay; faPlus = faPlus; faSearch = faSearch;

  activeUseCases = [];
  activeMockResponses = [];
  availableMockResponses: any= [];

  searchUseCases = [];
  useCaseSearchVisible = false;
  searchMockResponses = [];
  mockResponseSearchVisible = false;

  constructor(
    public mockResponseService: MockResponsesService,
    private useCaseService: UseCasesService,
    public auth: AuthorizedServiceService,
    private dialog: MatDialog,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this._setProperties();
  }

  setMockResponses(by = {key: ''}) {
    // filter available mock responses
  }

  openUseCaseDialog(useCase) {
    const dialogRef = this.dialog.open(UseCaseDialogComponent, { data: { useCase } });
  }

  openMockResponseDialog(mockResponse) {
    const dialogRef = this.dialog.open(MockResponseDialogComponent, { data: { mockResponse } });
  }

  showUseCasesSearch(by = {key: ''}) {
    this.useCaseService.getUseCases(by)
      .subscribe( (resp: any) => {
        const activeUseCaseIds = this.activeUseCases.map(el => el.id);
        this.searchUseCases = resp.useCases.filter(el => !activeUseCaseIds.includes(el.id));
        this.useCaseSearchVisible = true;
    })
  }
 
  showMockResponsesSearch(by = {key: ''}) {
    this.mockResponseService.getMockResponses(by)
      .subscribe( (resp: any) => {
        const activeMockResponseIds = this.activeMockResponses.map(el => el.id);
        this.searchMockResponses = resp.mockResponses.filter(el => !activeMockResponseIds.includes(el.id));
        this.mockResponseSearchVisible = true;
    })
  }

  activateUseCase(useCase) {
    this.useCaseService.activateUseCase(useCase.id).toPromise()
      .then(resp => this._setProperties());
  }

  deactivateUseCase(useCase) {
    this.useCaseService.deactivateUseCase(useCase.id).toPromise()
      .then(resp => this._setProperties());
  }

  activateMockResponse(mockResponse) {
    this.mockResponseService.activateMockResponse(mockResponse.id).toPromise()
      .then(resp => this._setProperties());
  }

  deactivateMockResponse(mockResponse) {
    this.mockResponseService.deactivateMockResponse(mockResponse.id).toPromise()
      .then(resp => this._setProperties());
  }

  _setProperties() {
    return this.useCaseService.getUseCases({activeOnly: 1}).toPromise()
      .then( (resp:any) => {
        this.activeUseCases = resp.activeUseCases;
        this.activeMockResponses = resp.activeMockResponses;
        this.availableMockResponses = resp.availableMockResponses;
      });
  }
 
  play(mockResp) {
    const req = {
      url: mockResp.req_url,
      method: mockResp.req_method || 'POST',
      body: mockResp.req_method !== 'GET' && mockResp.req_payload ? `{
          ${mockResp.req_payload.trim().split(',').map(el => `"${el.trim()}":""`).join(",")}
        }` : undefined
    };

    const httpCall = req.method === 'POST' || req.method === 'PUT'?
      this.http[req.method.toLowerCase()](req.url, req.body) :
      this.http[req.method.toLowerCase()](req.url);

    httpCall.subscribe(
      resp => {
        console.log('[mock-response]', req.url, req.method, resp.body, resp);
        this.snackBar.open(
          `${req.url} ${req.method} call is made. Check console`, 'X', { duration: 3000 }
        );
      }, 
      error => {
        console.error('[mock-response]', req.url, req.method, error);
        this.snackBar.open(
          `Error in ${req.url} ${req.method} call. Check console`, 'X', { duration: 3000 }
        );
      }
    );
  }
}
