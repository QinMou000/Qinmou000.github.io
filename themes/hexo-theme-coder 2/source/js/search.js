document.addEventListener('DOMContentLoaded', function(){
function goToLocalSearch(form){
  try{
    var q = form.q.value.trim();
    if(!q) return false;
    // redirect to local search page with query param
    var url = '/search/?q=' + encodeURIComponent(q);
    window.location.href = url;
    return false;
  }catch(e){
    return true;
  }
}

// Attach handler for the form if present
document.addEventListener('DOMContentLoaded', function(){
  var f = document.getElementById('site-search');
  if(f) f.onsubmit = function(){ return goToLocalSearch(this); };
});
