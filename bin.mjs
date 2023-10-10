#!/usr/bin/env node

/**
 * - [ ] Show price information for day/night prices and 5euro all day
 * - [x] Show contact information for service/questions
 * - [ ] Add a qr code for up to date information.
 */

// https://jsfiddle.net/5b14qtp2/70/

import mustache from 'mustache'
import qr from 'qr-image';

var svg_string = qr.imageSync('https://pafosbuses.com/tt?stop=1234', { type: 'svg' });

const reverse = array => [...array].reverse()

// import { } from 'ramda'

function time(hours = 0, minutes = 0) {
  // Ensure hours and minutes are within a valid range
  hours = (hours + Math.floor(minutes / 60)) % 24;
  minutes = minutes % 60;

  // Return an object representing the time
  const api = {
    hours,
    minutes,
    add(timeB) {
      let addedHours = api.hours + timeB.hours;
      let addedMinutes = api.minutes + timeB.minutes;

      // Handle carry-over from minutes to hours
      addedHours += Math.floor(addedMinutes / 60);
      addedMinutes = addedMinutes % 60;

      // Ensure hours are within the valid range
      addedHours = addedHours % 24;

      // Create a new time object with the added hours and minutes
      return time(addedHours, addedMinutes); // Better variable names: resultHours, resultMinutes
    },
    toString() {
      // Format the time as "HH:MM"
      const formattedHours = String(api.hours).padStart(2, '0');
      const formattedMinutes = String(api.minutes).padStart(2, '0');
      return `${formattedHours}:${formattedMinutes}`;
    },
    toJSON() {
      return {
        hours: String(api.hours).padStart(2, '0'),
        minutes: String(api.minutes).padStart(2, '0')
      }
    },
  };

  return api;
}

function minutes(m = 0) {
  return time(0, m)
}

function routeStopsTimes(departure, stops) {
  return stops.reduce((acc, stop) => {

    acc.departure = acc.departure.add(stop.time)

    acc.stops.push({
      ...stop,
      arrival: acc.departure
    })

    return acc

  }, {
    departure,
    stops: []
  })
}

const stops = [{
  name: 'Laourou Beach',
  time: minutes(0),
}, {
  name: 'Coral Beach Hotel',
  time: minutes(3)
}, {
  name: 'Coral Bay Ave. West',
  time: minutes(5),
}, {
  name: 'Coral Bay Ave. East',
  time: minutes(1),
}, {
  name: 'Coral Strip South',
  time: minutes(1),
}, {
  name: 'Coral Bay Roundabout', // ???
  time: minutes(6),
}, {
  name: 'Kissonergas',
  time: minutes(5),
}, {
  name: 'Potima Beach',
  time: minutes(5),
}, {
  name: 'Atlantica Mare',
  time: minutes(5),
}, {
  name: 'Gift Finder',
  time: minutes(3),
}, {
  name: 'Coastal Broadwalk',
  time: minutes(3),
}, {
  name: 'Sandy Beach',
  time: minutes(3),
}, {
  name: 'St. George',
  time: minutes(3),
}, {
  name: 'Patiga',
  time: minutes(3),
}, {
  name: 'Mersini',
  time: minutes(3),
}, {
  name: 'Dima',
  time: minutes(3),
}, {
  name: 'Demetrios II',
  time: minutes(3),
}, {
  name: 'Vrexi Beach',
  time: minutes(3),
}, {
  name: 'Venus Beach',
  time: minutes(3),
}, {
  name: 'Tombs of the Kings North',
  time: minutes(3),
}, {
  name: 'Tombs of the Kings South',
  time: minutes(3),
}, {
  name: 'New Station',
  time: minutes(3),
}, {
  name: 'Lighthouse Beach (Mall)',
  time: minutes(3),
}, {
  name: 'Ag. Solomoni Catacombe',
  time: minutes(3),
}, {
  name: 'Apostolou Pavlou Ave.',
  time: minutes(3),
}, {
  name: 'Harbour (Main Station)',
  time: minutes(3),
}]

const reverseStops = stops => stops.reduce((reversed, stop, index) => {
  const nextTime = stops[index + 1]?.time || minutes(0)
  const newStop = {
    ...stop,
    time: nextTime
  }

  return [newStop, ...reversed]
}, [])

const fromHarbor = {
  weekday: parseDepartures(`6:20
6:30
7:30
8:00
8:10
8:20
8:30
8:40
8:50
9:00
9:10
9:20
9:30
9:40
9:50
10:00
10:10
10:20
10:30
10:40
10:50
11:00
11:10
11:20
11:30
11:40
11:50
12:00
12:10
12:25
12:40
12:55
13:10
13:25
13:40
13:55
14:10
14:20
14:30
14:40
14:50
15:00
15:10
15:20
15:30
15:40
15:50
16:00
16:10
16:20
16:30
16:40
16:55
17:10
17:25
17:35
17:50
18:00
18:15
18:30
18:45
19:00
19:15
19:30
19:45
20:00
20:15
20:30
20:45
21:00
21:15
21:30
21:45
22:00
22:15
22:30
22:45
23:00
23:15
23:30
23:45
00:00
00:30`),

  weekend: parseDepartures(`6:20
6:30
7:30
8:00
8:10
8:20
8:30
8:40
8:50
9:00
9:10
9:20
9:30
9:40
9:50
10:00
10:10
10:20
10:30
10:40
10:50
11:00
11:10
11:20
11:30
11:40
11:50
12:05
12:20
12:30
12:40
12:55
13:10
13:20
13:30
13:40
13:50
14:00
14:10
14:20
14:30
14:40
14:50
15:00
15:10
15:20
15:30
15:40
15:50
16:00
16:10
16:20
16:35
16:50
17:05
17:20
17:40
18:00
18:15
18:30
18:45
19:00
19:15
19:30
19:45
20:00
20:15
20:30
20:45
21:00
21:15
21:30
21:45
22:00
22:15
22:30
22:45
23:00
23:15
23:30
23:45
00:00
00:30`),
  stops: reverseStops(stops),
}

const fromCoral = {
  weekday: parseDepartures(`7:00
8:05
8:35
8:45
8:55
9:05
9:15
9:25
9:40
9:50
10:00
10:10
10:20
10:30
10:40
10:50
11:00
11:10
11:20
11:30
11:40
11:50
12:00
12:10
12:20
12:30
12:40
12:50
13:00
13:15
13:30
13:45
14:00
14:15
14:35
14:50
15:00
15:10
15:20
15:30
15:40
15:50
16:00
16:10
16:20
16:30
16:40
16:50
17:00
17:10
17:20
17:30
17:45
18:00
18:10
18:25
18:35
18:50
19:05
19:20
19:35
19:50
20:05
20:20
20:35
20:50
21:05
21:20
21:35
21:50
22:05
22:20
22:35
22:50
23:05
23:20
23:35
23:50
00:05
00:20
00:35
01:05`),

  weekend: parseDepartures(`7:00
7:25
8:05
8:35
8:45
8:55
9:05
9:20
9:30
9:40
9:50
10:00
10:10
10:20
10:30
10:40
10:50
11:00
11:10
11:20
11:30
11:40
11:50
12:00
12:10
12:20
12:30
12:40
12:55
13:10
13:20
13:30
13:45
14:00
14:10
14:20
14:30
14:40
14:50
15:00
15:10
15:20
15:30
15:40
15:50
16:00
16:10
16:20
16:30
16:40
16:50
17:00
17:15
17:30
17:45
18:00
18:20
18:35
18:50
19:05
19:20
19:35
19:50
20:05
20:20
20:35
20:50
21:05
21:20
21:35
21:50
22:05
22:20
22:35
22:50
23:05
23:20
23:35
23:50
00:05
00:20
00:35
01:05`),

  stops
}


function parseDepartures(str) {
  return str.trim().split('\n').map(v => {
    return time(...(v.split(':').map(Number)))
  })
}

function stopArrivals(departures, stops) {
  const minuteOffset = stops.reduce((offset, {time}) => {
    return offset.add(time)
  }, time())

  return departures.map(time => time.add(minuteOffset))
}

const takeTill = (pred) => array => {
  let result = []

  array.find(value => {
    result.push(value)

    return pred(value)
  })

  return result
}

const tillStop = (stops, stop) =>
  takeTill(({name}) => name === stop.name)(stops)

const styleTemplate = `
<style>

@media print {
    section { page-break-before: always; } /* page-break-after works, as well */
}


body {
  font-family: Arial, sans-serif;
  font-size: 1.1em;
  margin: 0;
  padding: 0;
}

.border-none * {
  border-bottom: none;
}

ul, ol {
  list-style: none;
  padding: 0;
  margin: 0;
}

h1 {
  margin: 0;
}


li {
  border-bottom: 1px solid #00000088;
  padding: 0.2em 0;
}

h2 {
  font-size: 1.2em;
}

.weight-normal {
  font-weight: normal;
  opacity: 0.5;
}

.pr-1em {
  padding-right: 1em;
}

span {
  display: inline-block;
  width: auto;
}

.text-right {
  text-align: right;
}

.text-xl {
  font-size: 3em;
  margin-right: 1rem;

}

.text-lg {
  font-size: 1.2em;
}

section {
  position: relative;
  margin: 0;
  padding: 2em;
}

.container {
  display: flex;
  justify-content: space-between; /* Distributes columns with equal space between them */
}

.column {
  flex: 1; /* Makes the columns flex equally to fill the available space */
  padding-right: 2em;
  box-sizing: border-box; /* Ensures padding and border don't increase column width */
}

.contact {
  text-align: right;
  margin-top: 1em;
  font-weight: bold;
}

.contact .qr {
  display: inline-block;
  width: 3em;
  height: 3em;
}

.text-sm {
  font-size: 0.75em;
}

</style>
`

const template = `
<section>
<h1>
  <span class="text-xl">615</span>
  <span  class="text-right">

    <div class="weight-normal">
      From

    </div>

    <div class="weight-normal">
      To

    </div>

  </span>
  <span>
     <div>
      {{from.name}}
     </div>
     <div>
      {{to.name}}
     </div>

  </span>
</h1>

<div class="container">

<div class="column">

  <ol class="border-none">

    <li>
      <h2>{{currentStop.name}}</h2>
    </li>

    {{#stops}}
      <li>
        {{name}}
      </li>
    {{/stops}}

  </ol>

</div>

<div class="column">
  <h2>Monday - Friday</h2>
  <ol>
  {{#weekday}}

    <li>
      <b>{{0}}</b>
      {{#1}}
        <span>{{minutes}} </span>
      {{/1}}
    </li>

  {{/weekday}}
  </ol>
</div>

<div class="column">
  <h2>Saturday - Sunday & Holidays</h2>
  <ol>
  {{#weekend}}

    <li>
      <b>{{0}}</b>
      {{#1}}
        <span>{{minutes}} </span>
      {{/1}}
    </li>

  {{/weekend}}
  </ol>

  <div class="contact">
    <span>Call 8000 5588</span>
    <div class="qr">
      ${svg_string}
    </div>
  </div>

</div>

</div>


</div>

</section>


`

console.log(styleTemplate)

function fromStop(stops, stop) {
  let result = []

  const rev = reverse(stops)
  rev.find((x) => {
    result.push(x)

    return (stop.name === x.name)
  })

  return reverse(result)
}

const last = array => array[array.length - 1]

function groupBy(keyFn, values) {
  return values.reduce((acc, value) => {
    const lastKey = last(acc)?.[0]
    const key = keyFn(value)

    if (lastKey === key) {
      last(acc)[1].push(value)

      return acc
    }

    acc.push([
      key, [value]
    ])

    return acc
  }, [])
}

function toPairs(object) {
  return Object.keys(object).map(key => [key, object[key]])
}

function hour({hours}) {
  return hours
}

console.log(`<section>
  <h1>Print Instructions</h1>
  <p>Please open the HTML file in a browser and press <code>Ctrl + p</code>.</p>
  <p>This should open a print dialog. Here you can adjust the zoom level and configure margins.</p>
</section>`);

[fromHarbor, fromCoral].forEach(obj => {

  stops.forEach(stop => {
    const {
      stops,
      weekend,
      weekday,
    } = obj

    console.error(JSON.stringify(obj, null, 2))

    const upcoming = fromStop(stops, stop)
    const currentStop = upcoming.shift()


    console.log(mustache.render(template, {
      from: stops[0],
      to: last(stops),
      currentStop,
      stops: upcoming,
      weekday: groupBy(hour, JSON.parse(JSON.stringify(stopArrivals(weekday, tillStop(stops, stop))))),
      weekend: groupBy(hour, JSON.parse(JSON.stringify(stopArrivals(weekend, tillStop(stops, stop))))),
    }))

  })

})
