'use strict';

class Hacks {

  static button(link, text) {
    return `<a target="_blank" href="${link}" class="button-balanced button button-block" style="margin-bottom:-57px;z-index:1000;">${text}</a>`;     
  }

  static licenseform(obj) {
    //
    // Woahhhh what a crazy hack!
    //
    // This thing injects itself into an error message and displays a form for
    // the user to fill out their address. Then it takes the authorizations headers
    // from local storage to post the values back upstream and update the license.
    //
    // This is self-containted for the most part, with inline css and all the code needed 
    // to execute it, in a globally named UUIDb36 function.
    //
    // The document.querySelector thing is to close the parent dialog box by emulating
    // a click after the address gets posted.
    //
    // Also if someone was a bozo and filled out only half of the info, we put the 
    // stuff that they filled out in the form for them to complete it the next time. 
    // You know, like a real app.
    //
    // Otherwise, if it's empty, we assign a placeholder to it.
    //
    // This permits us to get addresses of the users on any one of the 20 (probably not
    // an exaggeration) or so versions of the app we currently have in the wild without
    // asking people to do an upgrade or anything silly like that.
    //
    // Is this really how I roll? Well, it's going to production like this so I guess so.
    // I look forward to my penance in programmer hell after I die.
    //
    // - cjm (2019/03/28)
    //
    var attr = {};
    [
      ['street1', 'Address Line 1'],
      ['street2', 'Address Line 2'],
      ['city', 'City'],
      ['state', 'State'],
      ['zip', 'Zip']
    ].forEach(row => {
      let [key, val] = row;
      attr[key] = [ 
        `name=${key}`, 
        obj[key] ? `value="${obj[key]}"` : `placeholder="${val}"` 
      ].join(' ');
    });
    
    let server = (process.env.NODE_ENV === 'production') ? 
       'https://api.waivecar.com' : 
       'http://staging.waivecar.com:4300';

    return `<div id=addy style=z-index:1000;background:#021207;padding:1rem;display:flex;align-items:center;justify-content:center>
<script>
let ok;
let i=setInterval(function(){
  ok=document.querySelector('.active .modal-actions button');
  if(i)clearInterval(i);
  ok.style.display='none';
},5);
function _79PUwdsNTrGQaEC9prFspA(e){
var d={},r,f=e.parentNode,x=new XMLHttpRequest(),a=JSON.parse(localStorage['auth']);
for(r of f.getElementsByTagName('input'))d[r.name]=r.value;
x.open('PUT','${server}/licenses',true);
x.setRequestHeader('Authorization',a.token);
x.setRequestHeader('Content-Type','application/json');
x.send(JSON.stringify(d));
x.onreadystatechange=function(){
  if(this.readyState==XMLHttpRequest.DONE)ok.click();
}}
</script><style>#addy input{background:#ddd;border:0;width:100%;padding:.25rem;margin:.5rem 0}</style><div>
<p>In an effort to improve service, please tell us your home address before continuing.</p>
<input ${attr.street1}><input ${attr.street2}><input ${attr.city} style=width:45%><input ${attr.state} style=width:13%;margin-left:5%><input ${attr.zip} style=width:32%;margin-left:5%><button class="button button-balanced button-block" onclick=_79PUwdsNTrGQaEC9prFspA(this)>save address</button>
</div></div>`;
  }
};

module.exports = Hacks;
