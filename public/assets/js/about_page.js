webpackJsonp([0,2],[function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function a(){var e={state:{search_results:[],conversation_list:[],history:[],chosen_conversation_id:0,enable_table_mode:!1,enable_show_person:!0,enable_show_time:!0,enable_show_msg:!0}};i.default.component("settings-vue",{template:"#settings-vue-component",data:function(){return e.state},methods:{closeSettingsDialog:function(){var e=document.querySelector(".setting-dialog");e.classList.add("setting-not-visible")}}}),i.default.component("menu-vue",{template:"#menu-vue-component",data:function(){return e.state},methods:{switchConv:function(e){this.$root.$data.chosen_conversation_id=e;var t=document.querySelector(".mdl-layout__obfuscator");t.click()},openSettingsDialog:function(){var e=document.querySelector(".setting-dialog");e.classList.remove("setting-not-visible");var t=document.querySelector(".mdl-layout__obfuscator");t.click()}}}),i.default.component("detail-vue",{template:"#detail-vue-component",data:function(){return{sharedState:this.$root.$data,chosen_conversation_id:0,enable_table_mode:!1}},watch:{sharedState:{deep:!0,handler:function(){this.$root.$data.chosen_conversation_id!==this.chosen_conversation_id&&(this.chosen_conversation_id=this.$root.$data.chosen_conversation_id,this.$root.$data.history=u.conversations.get(this.chosen_conversation_id)),this.$root.$data.enable_table_mode!==this.enable_table_mode&&(this.enable_table_mode=this.$root.$data.enable_table_mode)}}},methods:{}});var t=new i.default({el:"#app",data:e.state});return console.log("Vue is live!"),t}var r=o(1),s=o(4),i=n(s),c=o(5),l=n(c),u={conversations:[],imageByGaiaIdMap:new Map};!function(e){var t=a(),o=e.querySelector("#modal-example"),n=o.querySelector("button"),s=e.querySelector("#show-modal-example");o.showModal||l.default.registerDialog(o);var i=function(e){e&&o.close()},c=function(e){e&&o.showModal()};s.addEventListener("click",c),n.addEventListener("click",i);var d=(0,r.createSelectImageStream)("app-logo-container",t,u);d.subscribe(function(e){console.log(e)})}(document)},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=o(2),a=o(3),r=function(e,t,o){function r(e){t.conversation_list=e.conversation_list,o.conversation_list=e.conversation_list,o.conversations=e.conversations;var n=document.querySelector(".upload-status");n.classList.remove("upload-complete-not-visible"),n=document.querySelector(".upload-progress-bar"),n.classList.add("progress-bar-not-visible"),n=document.querySelector(".upload-dialog"),n.classList.add("upload-not-visible");var a=document.querySelector("#load-complete"),r={message:"JSON loaded",timeout:5e3,actionHandler:function(e){e&&a.classList.remove("mdl-snackbar--active")},actionText:"Close"};a.MaterialSnackbar.showSnackbar(r),n=document.querySelector(".mdl-layout__drawer-button"),n.click()}function s(){var e,t=[],n=[];return o.conversation_list.map(function(e){e.participants.map(function(e){n.push(e.name_id);var o=a.Observable.fromPromise(fetch("https://www.googleapis.com/plus/v1/people/"+e.name_id+"?key=AIzaSyD6SrPQUrQlVpmbC3qGR8lXwNorOW_jqH4")).flatMap(function(e){return e.ok&&console.log(e),a.Observable.just(e)}).catch(function(e){return console.log("There has been an error ",e.message),a.Observable.just(e)});t.push(o)})}),(e=a.Observable).merge.apply(e,t)}function i(e){var t=e;if(t){var o=t[0];if(o)return d.value=o.name,c.postMessage({file:o}),a.Observable.create(function(e){c.onmessage=function(t){t.data.conversation_list&&e.next({data:t.data})}})}return a.Observable.just(0)}var c=new n,l="#"+e,u=document.querySelector(l+' input[type="file"].kev-inputFile'),d=document.querySelector(l+' input[type="text"].kev-inputFileName'),v=document.querySelector(l+" div.kev-dropzone"),p=document.querySelector(l+" .kev-img-container > img.kev-preview"),f=document.querySelector(l+" .kev-inputFile-btn"),m=a.Observable.create(function(e){f.addEventListener("click",function(t){e.next({event:t,context:this,action:"click"})},!1)}).do(function(e){console.log(e),u.click()}),b=a.Observable.create(function(e){u.addEventListener("change",function(t){e.next({event:t,context:this,action:"change"})},!1)}).flatMap(function(e){var t=document.querySelector(".upload-progress-bar");return t.classList.remove("progress-bar-not-visible"),i(e.context.files)}).do(function(e){0!==e&&r(e.data)}).flatMap(function(e){if(e)return s()}),g=a.Observable.create(function(e){v.addEventListener("dragenter",function(t){t.stopPropagation(),t.preventDefault(),e.next({event:t,context:this,action:"dragenter"})},!1)}),_=a.Observable.create(function(e){v.addEventListener("dragleave",function(t){t.stopPropagation(),t.preventDefault(),v.classList.remove("kev-dragover"),p.classList.remove("kev-dragover"),e.next({event:t,context:this,action:"dragleave"})},!1)}),h=a.Observable.create(function(e){v.addEventListener("dragover",function(t){t.stopPropagation(),t.preventDefault(),v.classList.add("kev-dragover"),p.classList.add("kev-dragover"),e.next({event:t,context:this,action:"dragover"})},!1)}),y=a.Observable.create(function(e){v.addEventListener("drop",function(t){t.stopPropagation(),t.preventDefault();var o=t.dataTransfer,n=o.files,a=document.querySelector(".upload-progress-bar");a.classList.remove("progress-bar-not-visible"),e.next({event:t,context:this,action:"drop",files:n})},!1)}).flatMap(function(e){return i(e.files)}).do(function(e){0!==e&&(r(e.data),v.classList.remove("kev-dragover"),p.classList.remove("kev-dragover"),v.classList.remove("kev-init"))}).flatMap(function(e){if(e)return s()}),S=a.Observable.merge(m,b,g,_,h,y);return S};t.createSelectImageStream=r},function(e,t,o){e.exports=function(){return new Worker(o.p+"1c6cbdb0f141e0aacbf5.worker.js")}},function(e,t){e.exports=Rx},function(e,t){e.exports=Vue},function(e,t){e.exports=dialogPolyfill}]);
//# sourceMappingURL=about_page.js.map