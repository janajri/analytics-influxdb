# Analytics-InfluxDB
> NOTE: work-in-progress

Simple analytics logging for InfluxDB, heavily inspired by [analytics-node](https://github.com/segmentio/analytics-node)

Instantiate a new series queue to begin recording json data


###Install: 
  
  - `npm install analytics-influxdb --save`

###Usage:

``` javascript

	var Analytics = require('analytics-influxdb');
	var Signups = new Analytics("foo", "bar", {
			host: "http://inflxudb.mydomain.com:8086",
			dbName: "production",
			series: "signups"
	});

	var data = {
		username: "greenbeans",
		subscription: "1-month",
		address: {
			street: "1 milky way",
			city: "New York City",
			zip: 10012,
			state: "NY"
		}
	}

	Signups.track(data);
```

Displayed in influxDB as:

| time | host | pid| username | subscription | address.street | address.city | address.zip | address.state |
| ---- | ---| ---- |------- | -----| ------------- | -------------| ------------- | -------------|
| 1429842043737 | api.mydomain.com | 4563 | "greenbeans" | "1-month" | "1 milky way" | "New York City" |  10012 | NY |


* * *

### Analytics(username, password, options) 

Initialize a new `Analytics` with user, pass and and
optional dictionary of `options` including host.

> Note: 
 - All messages being tracked will flatten all nested fields i.e. { top: { nested: 'hi' } } => { "top.nested" : "hi }
 - All messages append process's host, pid, and time upon tracking

**Parameters**
* username: `String`
* password: `String`
* options: `Object`, (optional)


### flush(fn) 

Flush the current queue and callback `fn(err, batch)`.

**Parameters**
* fn: `function`, (optional)

### track(message, fn) 

Add a `message` to the queue and check whether it should be
flushed.

**Parameters**
* message: `Object`, fields
* fn: `Function`, (optional)

* * *










