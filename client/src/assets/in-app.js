// Usage
// <script src="assets/in-app.js" id="in-app" iframe-src="/#/set-use-case"></script>
const html = `<div class="mock-responses in-app js">
  <style>
    .mock-responses.in-app.js { z-index: 10000; position: fixed; top: 0; left: 0; }
    .mock-responses.in-app.settings {border: none; background: transparent;}
    .mock-responses.in-app.dialog { display: none; }
    .mock-responses.in-app.dialog.open {
      display: block; position:fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    }
    .mock-responses.in-app.dialog .blocker { 
      position: absolute; display: block; background: rgba(0,0,0,.5); 
      top: 0; left: 0; bottom: 0; right: 0; 
    }
    .mock-responses.in-app.dialog .contents {
      position: absolute; left: 0; top: 0; width: 800px; height: 100vh;
      background: #FFF; border: 12px solid #FFF; z-index: 1;
    }
  </style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />

  <button onclick="showDialog()" class="mock-responses in-app settings">
    <i class="fa fa-cog" aria-hidden="true"></i>
  </button>
  <div class="mock-responses in-app dialog">
    <div class="blocker" onclick="hideDialog()"></div>
    <div class="contents">
      <iframe id="iframe" width="100%" height="100%" frameborder="0"></iframe>
    </div>
  </div>
</div>`;

function showDialog() {
  document.querySelector('.mock-responses.in-app.dialog').classList.add('open');
  const iframe = document.querySelector('.mock-responses.in-app.dialog.open #iframe');
  const iframeSettings = iframe && iframe.contentDocument.querySelector('.settings');
  iframeSettings && (iframeSettings.style.display = 'none');
}
function hideDialog() {
  document.querySelector('.mock-responses.in-app.dialog').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', function() {
  try {
    const iframeSrc = document.querySelector('script#in-app').getAttribute('iframe-src');
    document.body.insertAdjacentHTML('beforeend', html);
    setTimeout(_ => {
      document.querySelector('.mock-responses.in-app.dialog #iframe').setAttribute('src', iframeSrc);
    }, 1000)
  } catch (e) {
    console.error('[mock-responses] error in script#in-app[iframe-src]');
    throw e;
  }
}, false);

window.addEventListener('message', event => {
  if (event.data === 'reload') {
    window.location.reload();
  }
});
