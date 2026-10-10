(function(){
 'use strict';
 let language='en';try{if(localStorage.getItem('hundred-language')==='ko')language='ko'}catch{}
 document.documentElement.lang=language;
 window.HundredI18n.localizeDOM(document.body,language);
 if(language==='ko')document.title='제작 정보 — 더 헌드레드';
})();
