---
title: "Achieving Infinite WPM in MonkeyType using Python"
date: 2023-04-26T08:06:25+05:30
description: An extensive Selenium tutorial with Python.
menu:
  sidebar:
    name: Infinite WPM with Python
    identifier: selenium
    weight: 30
author:
  name: Shravan Asati
  image: /images/author/shravan.png
math: true
hero: hero.png
---

So I have this one friend who constantly boasts about his sub-200 WPM typing speed. I tried competing with him but couldn't manage it above 100 WPM. I decided it was not worth the effort since I could beat him with the help of Python! :)

We'll be using the awesome [selenium](https://www.selenium.dev/) library for this task.

{{< vs 3 >}}

## Prerequisites

Just intermediate-level knowledge of Python. That's all. I'll be explaining selenium along the way. This is essentially a selenium tutorial since I love project-based learning.

{{< vs 3 >}}

## What is Selenium?

Selenium is a browser automation library which has bindings available for [several programming languages](https://www.selenium.dev/documentation/webdriver/getting_started/install_library/#requirements-by-language), including Python. We'll be exploiting the power of the selenium webdriver, which allows us to control the browser programmatically.

Selenium is mostly used for automated testing purposes, and occasionally to do such cool things.

Internally, selenium uses **webdrivers** provided by browsers such as the GeckoDriver for Firefox, the Chromedriver for Chrome and so on to control the browser.

{{< vs 3 >}}

## Development Setup

We need three things installed on our system to write selenium scripts - the language libraries, the browser we want to use, and the driver for that specific browser.

This used to be a cumbersome process for developers and often led to a lot of confusion among beginners, especially around having drivers on `PATH`.

Fortunately, the selenium team developed the [selenium manager](https://www.selenium.dev/documentation/selenium_manager/) which automatically manages the browser and driver, and ships with language libraries.

Thus all we need to do is to install the selenium library for Python.

This is simple:

```
pip install selenium==4.20.0
```
(v4.20.0 because I'm also using it.)

{{<alert type="info">}}
Ideally, you should also create a virtual environment to isolate your project dependencies from the system-wide ones. Read more about it [here](https://realpython.com/python-virtual-environments-a-primer/).

{{</alert>}}

{{< vs 3 >}}


## Some Gotchas

Before getting into writing code, I'd like to discuss some of the selenium gotchas.

- The browser knows it is being remotely controlled.

- None of your logins (cookies to be precise) of any websites, browser settings and extensions will be remembered when the browser is being controlled by selenium.

- Even the browsing history and cookies obtained during the session will not be saved.

- That means, if you’re performing an action like logging in or clicking the cookie popup, you’d have to do it every time a new session is opened.

- Don’t poke around too much with big websites, they have mechanisms to know a bot is playing with their website. They might IP block you.

- Selenium can’t get around smart captchas like reCAPTCHA, or any captchas for that matter, on its own.


## Writing the Script

Let's get to writing the code now. 

First of all, let's import the selenium library.

```py
from selenium import webdriver

from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
import selenium.webdriver.support.expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
```

You might notice that's a lot of imports, but bear with me - I'll explain them as we use them.

Let's start with opening the monkeytype website using selenium.

```py
driver = webdriver.Firefox()
driver.get("https://monkeytype.com")
```

If you want to use chrome, or any other browser use the respective class present in the `webdriver` module. For example, `Chrome`, `Edge`, `Safari`, `Ie` (why?) and so on. Also, if the browser immediately exits after loading the website, add an `input()` statement at the end of the file.

{{< alert type="info" >}}
The first time you'll run this script, it might take a lot of time before the browser window is opened since selenium downloads the necessary webdrivers first.
{{< /alert >}}

After running the script, this is what we see.

{{< img src="/posts/selenium/initial.png" title="Initial monkeytype page" >}}



{{< vs 3 >}}

## The Result

I recorded my screen and sent it to my friend. Let's just say, his reaction was pleasing to witness.

{{< vs 2 >}}

{{< youtube QS3sLXEaG0g >}}

{{< vs 2 >}}

Here's the full code:

{{< gist shravanasati 67c613b827db4ac34b0c90938e5e2692 >}}

{{< vs 2 >}}

Websites tend to change a lot - that means the HTML structure changes too. So in the near future, this script might no longer work due to element locators becoming obsolete. Between the time I first wrote the script and the publishing date of this blog, I've had to modify it twice. But with the knowledge and procedure I've shared above, you will be able to fix it.

Another thing - I tested this script on Firefox, Chrome and Edge - only Firefox had Infinite WPM, the chromium based browsers only did around 400wpm. This just proves why Firefox is superior `/s`.

{{< vs 2 >}}

## Going forward

The script is barely crossing 30 lines, yet we've managed to automate monkeytype with selenium.

You can modify this program to add some interactivity - like choosing a test mode and further adding options to change parameters like words and time. The code is also quite unorganized. I leave this as exercise to you, the reader; and if you manage to do it, please let me know on my socials (listed below).

Until then, bye.

{{< vs 3 >}}
