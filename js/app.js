/*jslint node: true */
'use strict';
import {createSelectImageStream} from './selectFileStream';
import Vue from 'Vue';
import dialogPolyfill from 'dialogPolyfill';
import $ from 'jQuery';
import Rx from 'rxjs/Rx';

var Worker = require("worker!./uploadfile-worker");
import { util } from './util';

let GLOBAL_OBJ = {
	conversations: [],
	imageByGaiaIdMap: new Map()
};

function createVueStuff(worker){

	worker.postMessage({msg: 'dvsdv'});

	let store = {
		state: {
			search_results: [],
			conversation_list: [],
			full_history: [],
			history: [],
			performance_mode: true,
			chosen_conversation_id: 0,
			enable_table_mode: false,
			enable_show_person: true,
			enable_show_time: true,
			enable_show_msg: true,
			profileImgByGaiaMap: {},
			scrollStreamSubscription: undefined
		}
	};

	Vue.component('settings-vue', {
		template: '#settings-vue-component',
		data: function(){
			return store.state;
		},
		methods: {
			closeSettingsDialog(){
				let el = document.querySelector('.setting-dialog');
				el.classList.add("setting-not-visible");
			}
		}
	});

	Vue.component('menu-vue', {
		template: '#menu-vue-component',
		data: function(){
			return store.state;
		},
		methods: {
			switchConv(conv_id){
				this.$root.$data.chosen_conversation_id = conv_id;
				document.querySelector('.msg-info').style.visibility = 'visible';
				let el = document.querySelector('.mdl-layout__obfuscator');
				el.click();

				this.scrollToTop();

				this.getProfileImgs();

			},
			scrollToTop(){
				$('.mdl-layout__content').animate({
				  scrollTop: 0
				}, 800, function(){

				// Add hash (#) to URL when done scrolling (default click behavior)
				  // window.location.hash = hash;
				});
			},
			openSettingsDialog(){
				let settingEl = document.querySelector('.setting-dialog');
				settingEl.classList.remove("setting-not-visible");
				let el = document.querySelector('.mdl-layout__obfuscator');
				el.click();
				this.scrollToSettings();
			},
			getProfileImgs(){
				let self = this;
				// console.log(this.$root.$data.chosen_conversation_id);
				// console.log(this.$root.$data.conversation_list[this.$root.$data.chosen_conversation_id]);
				let name_list = this.$root.$data.conversation_list
								.filter(function(conversation){
									return conversation.id === self.$root.$data.chosen_conversation_id;
								})[0]
								.participants.map(function(participant){
									return participant.name_id;
								});
				// console.log(name_list);

				worker.onMessage = function(e){
					if (e.data.action === 'getProfileImgs' && e.data.name_list){
						// console.log('got name list from worker');
						this.$root.$data.profileImgByGaiaMap = e.data.name_list;
					}
				};


				worker.postMessage({
					action: 'getProfileImgs',
					name_list
				});

			},
			scrollToSettings(){
				/* https://www.w3schools.com/jquery/tryit.asp?filename=tryjquery_eff_animate_smoothscroll */
				$('.mdl-layout__content').animate({
					scrollTop: $('#settings-dialog').offset().top
				}, 800, function(){

				// Add hash (#) to URL when done scrolling (default click behavior)
					// window.location.hash = hash;
				});
			}
		}
	});

	Vue.component('detail-vue', {
		template: '#detail-vue-component',
		data: function(){
			return {
				sharedState: this.$root.$data,
				chosen_conversation_id: 0,
				enable_table_mode: false,
				performance_mode: true
			};
		},
		mounted:function(){
        // code here executes once the component is rendered
        // use this in the child component
				document.querySelector('.msg-loading').style.visibility = 'hidden';
				document.querySelector('.msg-info').style.visibility = 'hidden';
    },
		watch: {
		    sharedState: {
	          deep: true,
	          handler: function(){
	          	if (this.$root.$data.chosen_conversation_id !== this.chosen_conversation_id){
	          		this.chosen_conversation_id = this.$root.$data.chosen_conversation_id;

	          		this.$root.$data.full_history = GLOBAL_OBJ.conversations.get(this.chosen_conversation_id);

	          		if (this.$root.$data.performance_mode === true){
	          			if (this.$root.$data.scrollStreamSubscription){
	          				this.$root.$data.scrollStreamSubscription.unsubscribe();
	          			}
	          			let self = this;
	          			this.$root.$data.history = [];
	          			this.$root.$data.scrollStreamSubscription = this.createScrollStream(this.$root.$data.full_history).subscribe(
	          				function(response){
	          					self.$root.$data.history = self.$root.$data.history.concat(response);
	          				});
	          		} else {
	          			this.$root.$data.history = this.$root.$data.full_history;
	          		}
	          		this.performance_mode = this.$root.$data.performance_mode;
	          	}

	          	if (this.performance_mode !== this.$root.$data.performance_mode){
	          		if (this.$root.$data.performance_mode === true){
	          			if (this.$root.$data.scrollStreamSubscription){
	          				this.$root.$data.scrollStreamSubscription.unsubscribe();
	          			}
	          			let self = this;
	          			this.$root.$data.history = [];
	          			this.$root.$data.scrollStreamSubscription = this.createScrollStream(this.$root.$data.full_history).subscribe(
	          				function(response){
	          					self.$root.$data.history = self.$root.$data.history.concat(response);
	          				});
	          		} else {
	          			this.$root.$data.history = this.$root.$data.full_history;
	          		}
	          		this.performance_mode = this.$root.$data.performance_mode;
	          	}




	          	if (this.$root.$data.enable_table_mode !== this.enable_table_mode){
	          		this.enable_table_mode = this.$root.$data.enable_table_mode;
	          	}


	          }
        	},
		},
		methods: {
			getImageUrl(senderId){
				let url = GLOBAL_OBJ.imageByGaiaIdMap.get(senderId);
				// console.log(senderId);
				// console.log(GLOBAL_OBJ.imageByGaiaIdMap);
				if (url){
					return url;
				}
				return '';
			},
			dissectArray(arr, chunkSize){
				var result = [], i;
				for (i = 0; i < arr.length; i += chunkSize){
					result.push(arr.slice(i, i + chunkSize));
				}
				return result;
			},
			createScrollStream(arr){
				let data = this.dissectArray(arr, 50);
				let currentIndex = 0;

				this.$root.$data.history = this.$root.$data.history.concat(data[currentIndex]);

				let stream = util.createScrollToBottomStream()
								.flatMap(function(){

									currentIndex += 1;
									if (currentIndex < data.length){
										document.querySelector('.msg-loading').style.visibility = 'visible';
										return Rx.Observable.of(data[currentIndex]);
									} else {
										document.querySelector('.msg-loading').style.visibility = 'hidden';
										return Rx.Observable.of([]);
									}
								});
				return stream;
			},
			updateHistory(newData){
				if (this.$root.$data.performance_mode === true){
					this.$root.$data.history.push(newData);
					document.querySelector('.msg-loading').style.visibility = 'hidden';
				}
			}
		}
	});

	let testApp = new Vue({
	    el: '#app',
	    data: store.state,
			created: function () {
				// `this` points to the vm instance
				console.log('Vue is live!');
			},
			methods: {
				openSettings(){
					let settingEl = document.querySelector('.setting-dialog');
					settingEl.classList.remove("setting-not-visible");
					this.scrollToSettings();
				},
				scrollToSettings(){
					/* https://www.w3schools.com/jquery/tryit.asp?filename=tryjquery_eff_animate_smoothscroll */
					$('.mdl-layout__content').animate({
						scrollTop: $('#settings-dialog').offset().top
					}, 800, function(){

					// Add hash (#) to URL when done scrolling (default click behavior)
						// window.location.hash = hash;
					});
				},
				openHelpDialog(){
					var dialog = document.querySelector('#modal-example');
					dialog.showModal();
				}
			}
	  });


	return testApp;
}







(function(document){
	let worker = new Worker();

	let vueInstance = createVueStuff(worker);

	/* these are for showing the sample dialog */
	var dialog = document.querySelector('#modal-example');
	var closeButton = dialog.querySelector('button');
	var showButton = document.querySelector('#show-modal-example');
	if (! dialog.showModal) {
	    dialogPolyfill.registerDialog(dialog);
	}
	var closeClickHandler = function(event) {
		if (event){
			dialog.close();
		}
	};
	var showClickHandler = function(event) {
		if (event){
			dialog.showModal();
		}
	};
	showButton.addEventListener('click', showClickHandler);
	closeButton.addEventListener('click', closeClickHandler);
	/* ---------------------------------------------------*/

	let stream = createSelectImageStream('app-logo-container', vueInstance, GLOBAL_OBJ, worker);
	stream.subscribe(
		function(response){
			console.log(response);
		}
	);



})(document);
