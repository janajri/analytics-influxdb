# Abacus-InfluxDB

> NOTE: work-in-progress

Simple analytics logging for InfluxDB, heavily inspired by [analytics-node](https://github.com/segmentio/analytics-node)

Instantiate a new series queue to begin recording json data


###Install: 
  
  - `npm install abacus-influxdb --save`

###Usage:

``` javascript

	var Abacus 	   = require('abacus-influxdb');
	var analytics = new Abacus("foo", "bar", {
			host: "http://inflxudb.mydomain.com:8086",
			dbName: "production",
			series: "signups"
	});

	var dataPt = {
		username: "greenbeans",
		subscription: "1-month",
		address: {
			street: "1 milky way",
			city: "New York City",
			zip: 10012,
			state: "NY"
		}
	}

	analytics.track(dataPt);
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

    - username: `String`
    - password: `String`
    - options: `Object`, (optional)


### flush(fn) 

Flush the current queue and callback `fn(err, batch)`.

  **Parameters**

    **fn**: `function`, (optional)

    **Returns**: `Analytics`


### track(message, fn) 

Add a `message` to the queue and check whether it should be
flushed.

  **Parameters**

    **message**: `Object`, fields

    **fn**: `Functino`, (optional)



### error(res) 

Get an error from a `res`.

  **Parameters**

    **res**: `Object`, Get an error from a `res`.

    **Returns**: `String`



* * *










