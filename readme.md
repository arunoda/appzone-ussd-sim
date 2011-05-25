Rich Simulator for Appzone USSD
===============================

Introduction
------------

A Rich Simulator for Appzone USSD. This support
	* real phone like experience
	* multiple phones support
	* easy to use UI
	* implements actual session support
	
Dependencies
------------
	* NodeJs 0.4.x
	* npm

Installation
------------
	* Download from: https://github.com/arunoda/appzone-ussd-sim
	* goto the folder and apply `npm install`

Usage
------
	* Running
		node start.js
	* Simulator UI will start on port 8001 by default
	* Simulator Server will start on port 8002 by default (where applicaton sends requests)

Configurations
--------------
	* use `./conf/config.js`
	
Sample App
----------
	* A Sample app has been created and placed in `./sample`
	* use `node sample/app.js` to start the sample app on port:8005
	* it has been configure to use with the default simulator settings
	* on the simulator configure it with `http://localhost:8005` to get started
	