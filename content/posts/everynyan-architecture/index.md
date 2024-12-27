---
title: "How I built an anonymous and exclusive social media website"
date: 2024-12-27T22:02:45+05:30
description: This article talks about the architectural decisions behind everynyan.
menu:
  sidebar:
    name: EveryNyan Architecture
    identifier: everynyan-architecture
    weight: 30
author:
  name: Shravan Asati
  image: /images/author/shravan.png
hero: hero.png
math: false
---

I've been working on [EveryNyan](https://everynyan.tech), an anonymous social media website exclusive to Adani University students for the past couple of months. This blog outlines some of the implementation details, architecture decisions behind it and the challenges we faced while working on this huge project.

The code which is being discussed in this blog can be found [here](https://github.com/shravanasati/everynyan).

### The Idea

Inspired by the movie Social Network, me and my friend [Nirav](https://ni3rav.me) thought of working on a social media website exclusive for our institute's students - with a twist - everything would be **anonymous**. The core feature of the website would be to create posts on certain boards (eg. confessions, gyan, random...), where other users could vote them (up or down) and write comments on the post. If it sounds a lot like 4chan and reddit, your observations are astute.

### Tech Stack

For the website, we decided to use [Next.js](https://nextjs.org), since using react alone has been a painful experience for both of us. Next.js tooling is pretty good (except for the initial build times) so we ended up using it. When we started working on the project, the latest Next version was 14, and we still use it, without any plans to upgrade to Next15 in the near future.

The integration of Next with [shadcn](https://ui.shadcn.com) & [v0](https://v0.dev) is also pretty neat.

For the database, we chose Firestore on a whim, and regret that decision now (more on that later).

The notifications service is written in Go which primarily uses boltdb, and an under-development automatic content-moderation service in Python.

### Anonymity and Exclusivity

The biggest challenge in the beginning was authentication - how do I make sure only students of my institute can login on the platform, without revealing their identities.
I thought long and hard about it, and after several rounds of discussion with LLMs, I went ahead with a seemingly simple solution - OTPs.

Every student of the institute has an email address of this form: `name.branchYear@adaniuni.ac.in`, I could send OTPs to this email to ensure only a specific set of students can login on the platform. 

Once the OTP is verified, a random token is generated (a UUID) and stored on cookies as well as the database. The email is only stored in the OTPs collections on the database, and not on the tokens collection. 

Thus, we only know who has signed up on the platform, but each login session is independent of the email - there's no way to backtrack a post or a comment author to the email with which the user had logged in.

This is a screenshot of a sample document from the OTPs collection (the actual OTP is hashed).

{{< img src="/posts/everynyan-architecture/otp.png" title="an image of otp doc from the database" >}}

{{<vs 1>}}

And this is a screenshot of a sample document from the tokens collection.

{{< img src="/posts/everynyan-architecture/token.png" title="an image of token doc from the database" >}}

{{<vs 1>}}

The `role` field can be either `admin` or `user` and is decided during the sign-in process based on the email. An `admin` user has special privileges - like access to the admin panel (more on that later).

For sending these OTP emails, I opted using the [Resend](https://resend.dev) API, it has great docs and library support, and with the `react-email` library, the email content can be a simple react component!

Everytime a login process is initiated, the email is first validated using a regular expression. If it passes the validation, an OTP is generated, stored on the database with the given email and an email is sent to the user.

If the above process was successfull, the user is redirected to a page where they can verify the OTP. If the verification is successfull, they are finally logged in on the platform. 

Each login session initially lasts for 14 days, but upon subsequent requests, the session lifetime keeps increasing.


### Lots of CRUD operations

What followed the implementation of role-based authentication is boring - lots of CRUD operations - for posts, comments, voting, and reports.

#### Flow

It was quite simple really - I followed this abstraction strategy for all user interactions with the database.

Step 1: Write appropriate database functions in `lib/firebase` using the firebase-admin sdk.

Step 2: Create server actions for the same in `lib/actions`, which typically consist of user authentication, and calling the database functions.

Step 3: Create react components in the `components` directory, which use the server actions (if applicable).

Step 4: Use those components in the app router.


This was pretty much the flow for all user interactions with the website. Some of them contained extensive client side code as well - especially the feed component which has lazy loading behavior for posts.

Forgot to mention: posts support markdown. We used the `MDX` library for the markdown editor and and the `react-markdown` library for rendering the markdown in the post page.

#### Post URLs

This is not really interesting but I want to mention it anyway - how post slugs are generated. Basically, each post has an ID, which is the only way to identify the post. But once a post is created, its URL might look like this: `https://everynyan.tech/post/jus_parody_of_a_song_r3xyny`. It is a combination of the first few alphanumeric characters of the title and the post ID. When this endpoint is hit, the server only reads the last 6 characters of the slug - which is the ID of the post. Yeah I stole this idea from reddit. It is quite nice tho - users can see kinda see what the post is about just from the URL.

#### Comments

Rendering comments was quite challenging too. In Firestore, they are stored in a flat structure in the comments collection of each post. Each comment has a parent ID, which is `null` for top-level comments and the ID of the parent comment for replies. LLMs came to the rescue - I knew I'd have to use a tree data structure but I wasn't sure how. I still don't understand how *exactly* the comments are being rendered along with their replies.

#### Admin Panel

The admin panel has four main components - a section to show total logged-in and current active users, a section to resolve reports, a section to broadcast notifications and a section to view security logs.

It is only accesible to users with the `admin` role.

#### Feed

Initially, there wasn't a 'feed' on EveryNyan, and the only way to browse posts was to go to the specific board page (`/board/confessions` for example). This wasn't ideal - even I was tired of navigating between different boards to look for new posts. 

So, we worked on a feed component which is similar to the board feed, except it gathers posts from all the boards. We also added sorting options in the feed - latest, popular, controversial, and engaging, similar to reddit.

The feed is shown on the root endpoint (`/`) to logged-in users.

### Why a RDBMS would be better

I earlier mentioned that we regret using Firestore as the primary database. It's because PostgreSQL is just that much better. Document databases often advertise their flexibility and the lack of schema as their main selling point. I really don't get it. It allows you to not think about the structure of your data properly. Yeah this happened quite some times while working on EveryNyan. Also querying in Firestore is weird. I prefer SQL (Sexy Query Language). 

The easy setup is nice but there's also ambiguity with the client and admin SDKs. Initially I was using the "web" <abbr title="Software Development Kit">SDK</abbr> which is meant to run from the client-side, but I am interacting with the database only on the server side. This later conflicted with the security rules thing. Maybe I'm just stupid but I find it hard to see any advantages in communicating with the database from the client side. I later had to go through the trouble of generating a service account key and switched to the "admin" SDK. This created another problem - turns out I was using some of the firebase code directly on the client side with client components in Nextjs. When I switched to the admin SDK, some "server" code was essentially running on client side (which obviously lacks Node standard library) and there were lots of weird import errors. This was a nice learning experience though - I learnt loads about Nextjs.

This is not really a negative point since Firebase is quite cheap but I still don't want to pay for database when I can host it for free on a <abbr title="Virtual Private Server">VPS</abbr> (I have lots of free credits). Cloud functions are available only on the paid plan. And there are also limited read and writes, although we're yet to hit the limit yet.

Search is a feature I'm excited to implement in EveryNyan. It requires a search engine. There are lots of them in the market - elasticsearch, meilisearch, etc. Search engines need to integrate with the database so they can keep their indexes up-to-date. To do this in Firestore, you need to be on a paid plan. Postgres has native support for Full-Text-Search. If you've a self-hosted instance, you also needn't worry about hitting the read-write limits.


That's why a SQL migration is planned, but I'm not sure when I will do it since it's quite a massive undertaking. Not only all the database code needs to be re-written, I need to migrate existing data from Firestore as well.

### Notifications

When we first launched EveryNyan publicly, we had great response. We crossed 100 sign-ups within several days even without significant marketing. It was very lively. Confessions, rants and controversial posts here and there. It seemed like the only way forward was upwards.

User activity was down by 90% the next week. We had a terribly low user retention. We quickly realized that people are not reopening EveryNyan - rightfully so - people were not yet addicted to it. The only way to re-engage users was notifications. "Someone liked your reply 👍", "Someone commented on your post 😜", "You're getting ratio'd 😲" was much needed. Nothing more exciting than fresh notifications disturbing you during productive periods.

Thus began a sweat-inducing, greuling journey to claw EveryNyan back from the brink of irrelevance. Notifications was definitely the biggest and hardest feature to implement so far.

This is what I came up with: there would be two kinds of notifications.

* Notifications Center

  These notifications will be shown behind a bell icon on the navbar and the dock, and will be visible only when the user opens the notifications page. These will be stored in the database and hence will be persistent.

* Realtime notifications

  These notifications will be delivered instantly to the user via two channels:

  * In-app notifications: 
    These will be shown using toasts. Everytime the website is loaded, a websocket connection with the notifications service will be established. It will then listen for notifications, and show them using toasts whenever the notifications service sends it one.

  * Push notifications: 
    Push notifications are delivered to the user's device regardless of whether the website/app (<abbr title="Progressive Web App">PWA</abbr>) is open or not. The user first needs to grant the website permission to show notifications. But it is a great way to increase user engagement. Since EveryNyan already had a PWA, I just had to add custom service worker code to react to push notification events.

This was my initial architecture design for the notifications service. I chose Go for it because I felt like it.

{{< img src="/posts/everynyan-architecture/notifications.png" title="initially planned notifications system architecture" >}}

{{<vs 1>}}

**Spoiler alert**: I didn't add a message queue because 

1. I thought it would be overengineering for an app of this scale (barely hundred users)
2. I was lazy


#### Notifications Center

I started with the notifications center since it was easier to implement. 

First things first, posts and comments didn't have an author field before - shit was truly anonymous. But to make notifications possible, we need to know which "user" ("token" to be technically accurate) wrote a certain post or comment. So, I added an author field to post and comment types, and when these are created, the session token is added in the 'author' field.

Currently, automated notifications are created only on comments. When a comment is written, the post author, and all the parent comment authors in the comment chain (if applicable) are eligible to be notified. Once all the notifiable users are fetched, the notifications collection on firestore is filled with documents with this type.

```ts
export type NotificationType = {
  user: string,
  title: string,
  description: string,
  status: "unread" | "read",
  link: string,
}
```

Next, I created a notifications page which fetches all the documents in the notifications collection where user is the current user and status is unread. Once the page is opened, all unread notifications are marked as read.

I also added the notification bell icon on the dock and the navbar. The dock icon also shows the unread notification count.


#### Realtime Notifications

Realtime notifications are handled by a separate service written in Go. The code can be found [here](https://github.com/shravanasati/everynyan-notification-service).

##### In App Notifications

As discussed above, in-app notifications are delivered via websockets. Everytime the website is loaded, a websocket connection is established with the notifications server which is hosted at `notifications.everynyan.tech`. The server first authenticates the user using firebase. If the authentication is successfull, it adds the websocket connection to a list of active connections.


Whenever a notification is created, the Next.js server sends a HTTP POST request to this Go server. The request data contains an array of notification object, each having a title, description, link and the user it is targeted to. For each notification object, if the target user is currently online (i.e., the websocket connection exists), a JSON message is sent to it. The client reads the message and shows a toast to the user.

This was not *very* hard to implement but I had some nasty issues. 

1. The cookies were not sent from the browser to the notifications service. This was causing authentication failure and all subscription requests were being rejected. After a lot of searching, I came to know that cookies are not sent even to subdomains by default. The fix was to add a `Domain` attribute while setting cookies with the value `everynyan.tech`. Now, cookies will be sent to subdomains of `everynyan.tech` as well.

2. The notifications service sits behind a Nginx reverse proxy. Nginx doesn't accept websocket connections by default. I didn't know much about the nginx configuration so I hacked it together with the help of stackoverflow. I made the following changes:

    ```nginx
    location / {
      proxy_pass http://localhost:7924;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header Host $host;

      # websocket support
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
    ```

{{<vs 1>}}

3. The websocket connections were being dropped after exactly 30s, for no apparent reason. To solve this, I implemented a heartbeat mechanism in which the client and server exchange ping-pong messages every 15s. I didn't debug the exact cause of this issue, I have a hunch this too might be due to some misconfiguration.

##### Push Notifications

This was the most painful experience I've ever had in my entire programming career.

For all the features EveryNyan has had yet, I've had the general idea on how to implement them. Since push notifications was a completely new topic for me, I had no idea how to do it. Lots of reading ensued. MDN had great articles on implementing the client-side of push notifications, and for the server-side I had to make do with the webpush library docs. This is the Go [library](https://github.com/SherClockHolmes/webpush-go) I used. Its docs were minimal, so I also looked up docs for an equivalent library in Python. It explained the webpush and VAPID flow better. For the next-specific implementation, I borrowed some code from this [repo](https://github.com/david-randoll/push-notification-nextjs/tree/main) as well.

Since I kind of understand it now, let me break it down.

Push notifications are delivered using the webpush protocol. The webpush protocol ensures end-to-end encryption of messages so that only the browser can read it. The authentication is performed using a pair <abbr title="Voluntary Application Identification">**VAPID**</abbr> keys. The public key is shared with the browser and the private key is kept only on the server.

###### Client side implementation

A [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) must be registered which listens for the push event. A service worker is basically some code which is executed in the background by the browser. It runs in a different thread and has **no** access to the DOM or other browser APIs like `fetch` and `WebStorage`. It can only react to events.

Once a service worker is installed and running, it can react to events.

```js
self.addEventListener('push', function(event) {
  const data = event.data.json();
  console.log('Push received...', data);
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon
  });
});
```

But before notifications can be shown to users, the user must grant the website permission to show notifications. One caveat with requesting this permission is to do it in response to a user gesture. Some browsers like Firefox outright reject the request if it wasn't done in response to a user gesture, and Chrome has plans to do the same. In EveryNyan, if a user hasn't granted this permission, a toast is shown to them with a 'subscribe' button.

```js
function requestNotificationPermission() {
  Notification.requestPermission().then(function(permission) {
    if (permission === 'granted') {
      subscribeUserToPush();
    }
  });
}
```

Once the permission is granted, the `subscribeUserToPush` function might look like this:

```js
function subscribeUserToPush() {
  navigator.serviceWorker.ready.then(function(registration) {
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    };

    return registration.pushManager.subscribe(subscribeOptions);
  })
  .then(function(pushSubscription) {
    console.log('Received PushSubscription:', JSON.stringify(pushSubscription));
    return sendSubscriptionToServer(pushSubscription);
  });
}
```

The push manager returns a **subscription** object which looks like this:

```json
{
	"endpoint": "an endpoint URL...",
	"keys": {
		"auth":   "auth key",
		"p256dh": "p256dh key",
	}
}
```

The `endpoint` is an URL for the push service where our server will send notifications. Each browser vendor maintains their own push service which acts as an intermediary between the browser and server. It checks the VAPID signatures, maintains a message queue if the browser is offline, and finally relays the message to the appropriate service worker. For example, Chrome has FCM, and Mozilla has autopush.

Once the subscription is created, it needs to be sent to the notifications server. 

###### Server side implementation

The notifications server receives the push subscription and stores it on a persistent database, which is [BoltDB](https://github.com/boltdb/bolt) in this case. I used it because a key-value pair is all I needed, the user token and the push subscription.

The code for sending push notifications is pretty minimal, the webpush-go library does all the heavy lifting.

```go
func _sendPushNotificationBytes(message []byte, subscription webpush.Subscription) {
	fmt.Println("sending this push notification:", string(message))
	resp, err := webpush.SendNotification(message, &subscription, &webpush.Options{
		Subscriber: "dev.shravan@proton.me",
		VAPIDPublicKey: vapidPublicKey,
		VAPIDPrivateKey: vapidPrivateKey,
		Urgency: webpush.UrgencyNormal,
	})

	if err != nil {
		log.Println("unable to send push notification", err)
		return
	}

	defer resp.Body.Close()
}
```

Internally, the library encrypts the content using the subscription keys, and prepares a HTTP request to the subscription endpoint (the push service).

###### Challenges

This might become a bit repetitive but this *unexpectedly* also did not work on the first try. The issues I encountered this time were:

1. Initially, push subscription was being sent directly to the notifications service from the browser. And ofcourse CORS was a pain in the ass. Despite many attempts to fix it, it still wouldn't go away, despite the websocket connection was being successfully established with the service. I don't understand how a GET request works but POST wouldn't even though I specified it in the next config file.

  ```js
    ...
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Access-Control-Allow-Origin",
              value: notificationsServerAddress,
            },
            { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
            {
              key: "Access-Control-Allow-Headers",
              value:
                "Content-Type, Authorization, Content-Length, X-Requested-With",
            },
            { key: "Access-Control-Allow-Credentials", value: "true" },
          ],
        },
      ];
    },
    ...
  ```

  I gave up and made a new API route at the endpoint `/api/subscription`, and then sent the user token and the subscription object to the notifications service from nextjs server.

2. This was a very stupid mistake. In the push event handler of the service worker, I was re-parsing the json object, which returned `undefined`. Notifications were thus not being shown properly. I hate javascript.

```js
self.addEventListener('push', function(event) {
  const data = JSON.parse(event.data.json());
  console.log('Push received...', data);
  ...
}
```

The fix was simple, I just removed `JSON.parse`.


#### Broadcast

The admin panel has a broadcast section as well - from which an admin can broadcast realtime notifications, both in-app and push ones to all the users. Its implementation is also similar, instead of targeting a user, the Go service sends the given notification to all the subscribers. I currently use it to send zomato-style notifications about the hottest post of the day, although I plan to automate it too.

### Automod

Moderating content manually is tiring. The moderation service will be responsible for automatically moderating posts and comments on the platform, to prevent excessive toxicity. The problem is that all the pre-trained models I've tried so far don't seem to fit our requirements. We want a certain level of toxicity on the platform, otherwise it would be boring. Then there's also an issue with Hindi, none of the models seem to understand Hindi. I tried integrating translation services but the results were not upto the par.

After discussions with multiple ML experts, the conclusion we've arrived to is to make our own model using our own data. This would be a great learning experience.

The code written for this service so far can be found in this [repo](https://github.com/shravanasati/everynyan-moderation-service).

### Planned Features

We've certainly ticked all the boxes for EveryNyan's MVP. The project is however far from over. There are so many features that are under progress and in the planning stage. The ones I'm most excited about is GIF support, images support, search and active users 😭.


This was quite a long read. Thanks for reading so far. If you've any questions or suggestions, I'm all [ears](https://shravanasati.me#about).
