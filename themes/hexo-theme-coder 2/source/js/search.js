function prefixSiteQuery(form){
  try{
    var q = form.q.value.trim();
    if(!q) return false;
    // if user already included site: don't double-add
    if(!/^\s*site:/i.test(q)){
      form.q.value = 'site:qinmou000.github.io ' + q;
    }
    return true;
  }catch(e){
    return true;
  }
}

// Attach handler for the form if present
document.addEventListener('DOMContentLoaded', function(){
  var f = document.getElementById('site-search');
  if(f) f.onsubmit = function(){ return prefixSiteQuery(this); };
});
