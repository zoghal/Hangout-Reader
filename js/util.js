/*jslint node: true */
'use strict';

var twemoji = require('twemoji');
import $ from 'jQuery';
import Rx from 'rxjs/Rx';

let ALL_PARTICIPANTS = {};
let CONVERSATION_LIST = [];
let CONVERSATIONS = {};

function zeroPad(string) {
	return (string < 10) ? "0" + string : string;
}

function formatTimestamp(timestamp) {
	var d = new Date(timestamp/1000);
	var formattedDate = d.getFullYear() + "-" +
	    zeroPad(d.getMonth() + 1) + "-" +
	    zeroPad(d.getDate());
	var hours = zeroPad(d.getHours());
	var minutes = zeroPad(d.getMinutes());
	var formattedTime = hours + ":" + minutes;
	return formattedDate + " " + formattedTime;
}

function getParticipantsAndConversationList(data){
	let g_conversation_list = data.conversation_state;

	let conversationList = g_conversation_list.map(function(item){
		let g_participant_data = item.conversation_state.conversation.participant_data;
		let g_conversation_id = item.conversation_id.id;

		// Get all participants
		let participants = g_participant_data.map(function(participant){
			if(!participant.fallback_name || participant.fallback_name === null){
				let unknown_constant = -1;
				ALL_PARTICIPANTS[unknown_constant] = {};
				ALL_PARTICIPANTS[unknown_constant][g_conversation_id] = 'Unknown';

				return {
					name_id: -1,
					name: 'Unknown'
				};
			} else {
				let fallback_name = participant.fallback_name;
				let gaia_id = participant.id.gaia_id;

				if (ALL_PARTICIPANTS[gaia_id]){
					ALL_PARTICIPANTS[gaia_id][g_conversation_id] = fallback_name;
				} else {
					ALL_PARTICIPANTS[gaia_id] = {};
					ALL_PARTICIPANTS[gaia_id][g_conversation_id] = fallback_name;
				}

				return {
					name_id: gaia_id,
					name: fallback_name
				};

			}

		});

		let list = '';
		participants.map(function(item){
			list = list + ', ' + item.name;
		});
		list = list.substr(2);

		return {
			id: g_conversation_id,
			participants,
			list
		};

	});

	return conversationList;
}


function getConversations(data){
	let conversation_states = data.conversation_state;

	let result = conversation_states.map(function(item){
		let g_conversation_id = item.conversation_id.id;
		let g_events = item.conversation_state.event;

		let history = g_events.map(function(event){
			let timestamp = event.timestamp;
			let msgtime = formatTimestamp(timestamp);
			let sender = event.sender_id.gaia_id;
			let sender_name = 'Unknown';
			let content = {
				message: '',
				photo: {
					url: '',
					thumbnail: ''
				}
			};

			if (event.chat_message){
				let chatMsg = event.chat_message;
				let segments = chatMsg.message_content.segment;
				let attachments = chatMsg.message_content.attachment;

				// Try and get messages
				if (segments){
					content.message = segments.reduce(function(acc, segment){
						if (segment.text){
							return acc + twemoji.parse(segment.text);
						}
					}, '');
				}

				// Try and get photos
				if (attachments){
					content.photo = attachments.map(function(attachment){
						if (attachment.embed_item.type[0] === "PLUS_PHOTO"){
							return {
								url: attachment.embed_item['embeds.PlusPhoto.plus_photo'].url,
								thumbnail: attachment.embed_item['embeds.PlusPhoto.plus_photo'].thumbnail.image_url
							};
						} else {
							return {
								url: '',
								thumbnail: ''
							};
						}
					});
					// seems like only one photo shows up every time
					content.photo = content.photo[0];
				}

			} else if (event.event_type === 'HANGOUT_EVENT'){
				if (event.hangout_event.media_type === 'AUDIO_ONLY'){
					if (event.hangout_event.hangout_duration_secs){
						content.message = 'Voice Call: ' + event.hangout_event.hangout_duration_secs + ' seconds';
					} else {
						content.message = 'Failed voice call.';
					}
				} else if (event.hangout_event.media_type === 'AUDIO_VIDEO') {
					if (event.hangout_event.hangout_duration_secs){
						content.message = 'Video Call: ' + event.hangout_event.hangout_duration_secs + ' seconds';
					} else {
						content.message = 'Failed video call.';
					}
				}
			}

			if (ALL_PARTICIPANTS[sender]){
				sender_name = ALL_PARTICIPANTS[sender][g_conversation_id];
			}

			return {
				// msgTime: msgTime,
				sender_id: sender,
				sender_name,
				timestamp,
				msgtime,
				content
			};

		});

		// Sort events by timestamp
		history.sort(function(a, b){
			var keyA = a.timestamp,
			    keyB = b.timestamp;
			if( keyA < keyB ) { return -1; }
			if( keyA > keyB ) { return 1; }
			return 0;
		});

		return {
			conversation_id: g_conversation_id,
			history
		};

	});

	return result;
}

function handleFile(data){

	let Hangouts = JSON.parse(data);
	CONVERSATION_LIST = getParticipantsAndConversationList(Hangouts);
	CONVERSATIONS = getConversations(Hangouts);
	// console.log(CONVERSATION_LIST);
	// console.log(CONVERSATIONS);
	// console.log(result.conversation_list);
	// console.log(result.conversations);
	// console.log(result.all_participants);

	let conversations = new Map();
	CONVERSATIONS.map(function(item){
		// console.log(item.conversation_id);
		conversations.set(item.conversation_id, item.history);
	});
	// console.log(conversations.get('UgylVwHUsKjYT5sSElJ4AaABAQ'));


	// createVueStuff(CONVERSATION_LIST, conversations);
	// vueInstance.conversation_list = CONVERSATION_LIST;
	// GLOBAL_conversations = conversations;
	//
	// console.log(CONVERSATION_LIST);

	return [CONVERSATION_LIST, conversations];
}

function createWindowScrollStream(element='.mdl-layout__content'){
	let winHeight = $(window).height();
	let scrollingStream = Rx.Observable.fromEvent($(element), 'scroll')
				.map((se) => {
					return {
						scrollTop: se.target.scrollTop,
						scrollHeight: se.target.scrollHeight,
						clientHeight: se.target.clientHeight
					};
				})
				.do(function(response){
					console.log(response);
				})
				.filter((x) => x.scrollHeight === x.scrollTop + winHeight);
	return scrollingStream;
}

function createScrollToBottomStream(element = '.mdl-layout__content'){
	let stream = Rx.Observable.create(function(o){
		$(element).scroll(function(se){
			let scrollTop = se.target.scrollTop,
					scrollHeight = se.target.scrollHeight,
					clientHeight = se.target.clientHeight;

			if ((scrollTop + clientHeight + 10) > scrollHeight){
					console.log('scroll to bottom');
					o.next({
						message: 'scroll to bottom'
					});
			}
		});
	});
	return stream;
}




let util = {
	handleFile,
	createWindowScrollStream,
	createScrollToBottomStream
};




export { util };
