'use strict';

var bluebird= require('bluebird'),
  co= require('co'),
  cofs= require('co-fs'),
  fs= require('fs'),
  gather= require('co-gather'),
  thunkify= require('thunkify-wrap'),
  nunjucks= require('nunjucks')

var _env= new nunjucks.Environment(new nunjucks.FileSystemLoader('nun'))

var loadedTemplates= bluebird.promisify(fs.readdir, fs)('./nun').then(function(templates){
	// load all templates
	var getTemplate= bluebird.promisify(_env.getTemplate, _env),
	  loaded= templates.map(getTemplate)
	// resolve when all settle
	return bluebird.settle(loaded)
})

/*
var _getTemplate= thunkify.genify(_env.getTempalte, _env)
var loadTemplates= function *loadTemplates(){
	// read `nun` subdirectory
	var nunDir= yield fs.readdir('./nun')

	// prep to load all templates in `nun` directory
	var loads= runDir.map(function(template){
		return _getTemplate(template)
	})
	// load all templates
	var loaded= yield gather(loads)
	return loaded
}
var loadedTemplates= co(loadTemplates)()
*/

var _render= bluebird.promisify(_env.render, _env)

module.exports.renderer= function(data){
	return function*(){
		// wait for templates to be loaded
		yield loadedTemplates

		// render
		//var text= yield _render('event.div', this)
		var text= JSON.stringify(data)

		// read existing file
		var same= false
		try{
			var existing= yield cofs.readFile('./lib/'+data.id, 'utf8')
			if(existing == text){
				return false
			}
		}catch(err){
		}

		yield cofs.writeFile('./lib/'+data.id, text, {encoding:'utf8'})
		return true
	}
}
