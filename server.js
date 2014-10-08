#!/usr/bin/env node
'use strict';

var Event= require('./event'),
  co= require('co'),
  cogent= require('cogent'),
  gather= require('co-gather')

var EVENTS_URL= 'https://api.meetup.com/2/events?&photo-host=public&page=100&group_urlname=',
  GROUP_URLNAME= 'Data-Community-DC',
  KEY= process.argv[2]

function sync(opts){
	opts= opts|| {}
	opts.groupUrl= opts.groupUrl|| GROUP_URLNAME
	opts.url= opts.url|| (EVENTS_URL+opts.groupUrl+'&key='+KEY)
	return co(function*(){
		// download json
		var events= yield* cogent(opts.url, true),
		  res= events.body.results
		if(!res)
			throw new Error('No results: ' + events.body.problem)

		// we have 100 events - save them
		var saveEvents= res.map(Event.renderer),
		  savedEvents= yield gather(saveEvents)
		return savedEvents
	})
}

sync()()
