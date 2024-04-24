---
title: "Achieving Infinite WPM in MonkeyType using Python"
date: 2020-04-26T08:06:25+05:30
description: An extensive Selenium tutorial with Python.
menu:
  sidebar:
    name: Selenium Tutorial
    identifier: selenium
    weight: 30
author:
  name: Shravan Asati
  image: /images/author/shravan.png
math: true
---

So I have this one friend who constantly boasts about his sub-200 WPM typing speed. I tried competing with him but couldn't manage it above 100 WPM. I decided it was not worth the effort since I could beat him with the help of Python! :)

We'll be using the awesome [selenium](https://www.selenium.dev/) library for this task.

## Prerequisites

Just intermediate-level knowledge of Python. That's all. I'll be explaining selenium along the way. This is essentially a selenium tutorial since I love project-based learning.

## What is Selenium?

Selenium is a browser automation library which has bindings available for [several programming languages](https://www.selenium.dev/documentation/webdriver/getting_started/install_library/#requirements-by-language), including Python. We'll be exploiting the power of the selenium webdriver, which allows us to control the browser programmatically.

Selenium is mostly used for automated testing purposes, and occasionally to do such cool things.

Internally, selenium uses **webdrivers** provided by browsers such as the GeckoDriver for Firefox, the Chromedriver for Chrome and so on to control the browser.

## Development Setup

We need three things installed on our system to write selenium scripts - the language libraries, the browser we want to use, and the driver for that specific browser.

This used to be a cumbersome process for users and often led to a lot of confusion among beginners.
Fortunately, the selenium team developed the [selenium manager](https://www.selenium.dev/documentation/selenium_manager/) which automatically manages the browser and driver, and ships with language libraries.

Thus all we need to do is to install the selenium library for Python.

This is simple:
```
pip install selenium==4.9.1
```
(v4.9.1 because I'm also using it.)

Ideally, you should also create a virtual environment to isolate your project dependencies from the system-wide ones. Read more about it [here](https://realpython.com/python-virtual-environments-a-primer/).


## Writing the Script

Let's get to writing the code now. 

First of all, let's import the selenium library.

```py
from selenium import webdriver
from selenium.webdriver.firefox.service import Service as FirefoxService

# from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
import selenium.webdriver.support.expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
```

You might notice 


## The Result

## Going forward