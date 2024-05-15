---
title: "Achieving Infinite WPM in MonkeyType using Python"
date: 2024-05-16T00:32:25+05:30
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

{{< vs 1 >}}

So we've visited the MonkeyType website using Selenium. The next step is to interact with the website.

The first thing we see is the cookie popup, and since I mentioned before that browsers remove all cookies obtained during the selenium, we'll have to click either accept or reject button everytime the website is opened.

Let's code clicking the "reject non-essential" button.

Everytime we want to interact with a web element using selenium, like clicking or simulate typing, we have to find that element. Selenium provides a neat way to do it - we can use CSS selectors, IDs, classes, XPATH, tag names and so on.

Open the browser developer tools (<kbd><kbd>CTRL</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd></kbd> or <kbd>F12</kbd>) and go to the **Inspector** tab. Click on the element picker icon (or press <kbd>Ctrl+Shift+C</kbd>) and click on the **reject non-essential** button.

You'll see the resulting HTML code responsible for that button. Upon looking at the HTML definition of that button, you'll see that this button has a class of `rejectAll`.

```py
print("clicking reject all")
rejectbutton = driver.find_element(By.CSS_SELECTOR, "button.rejectAll")
rejectbutton.click()
```

The `find_element` method of the driver takes two arguments - the locator strategy and the locator value. We have used CSS selectors here. The `By` class (more like an enum) has various locator strategies defined as constants. 

The `click` method is straight-forward, we store the element we found in a variable and then call the click method on it.

Note that the `find_element` method will raise the `NoSuchElementException` if it doesn't find the element based on the locator we provided.

Next, we need to configure the test options. I've decided to go for the **words** test with 25 words. That's also easy - just find the elements and click them.

Open the dev tools again and pick the words option. We don't find any ID or class associated with this element. Let the dev tools do the heavy lifting, just right click on the element and copy its selector. Do the same for selecting the number of words.

```py
print("selecting words -> 25")
words_btn = driver.find_element(By.CSS_SELECTOR, "div.mode > div:nth-child(2)")
words_btn.click()

wait = WebDriverWait(driver, timeout=10, poll_frequency=.5, ignored_exceptions=errors)
wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".wordCount > div:nth-child(2)")))
words_btn = driver.find_element(By.CSS_SELECTOR, ".wordCount > div:nth-child(2)")
words_btn.click()
```

The finding and clicking of elements is the same - however we're also using **explicit waits** here.

Waits in selenium, as the name implies, used to wait. While working with selenium, we often need to wait after we've performed a certain action. Perhaps an element we interacted changes a lot of the webpage structure, or redirects us somewhere else. In these cases, we use waits.

There are two kinds of waits in selenium - **implicit** and **explicit** waits. Implicit waits are simple, once set for the driver, everytime selenium locates an element it waits for the given number of seconds while simultaneously trying to locate the element. If selenium is unable to find the element even after waiting, it will throw the `NoSuchElementException`. 

```py
driver.implicitly_wait(2)
```

This will set an implicit wait for the driver. Note that this is a global setting that applies to every element location call for the entire session. If the element is found, for example, in a second, driver will not wait any longer. It will return element reference and continue executing further.

As you might've already guessed, using implicit waits is not a very good idea. You can never know how long will it take for requests to finish. A better solution is to use explicit waits.

Explicit waits have a condition associated with them that must evaluate to `True` before the code can continue executing. An explicit wait can be initialized as follows:

```py
wait = WebDriverWait(driver, timeout=10, poll_frequency=.5, ignored_exceptions=errors)
```

The driver and timeout argument must be given. The timeout is the max duration you want driver to spend waiting until the given condition evaluates to `True`. Obviously, you don't want your code to spend an eternity waiting in case the condition can never be `True`. A `TimeoutException` will be thrown when the timeout is over.

The rest two arguments, `poll_frequency` and `ignored_exeptions` tell selenium how long to sleep before evaluating the condition and which exceptions to ignore, if any occur, respectively.

The `wait` object has two public methods - `until` and `until_not`.

```py
wait.until(lambda d: element.is_displayed())
```

Both `until` and `until_not` methods accept a function which takes the driver as argument, and returns a truthy value which will then stop the wait.

We can use these methods to wait until a element is visible, present in the DOM and so on. The `expected_conditions` module we imported above comes with a lot of helpful pre-defined functions that do these tasks. Make sure to check their [documentation](https://www.selenium.dev/selenium/docs/api/py/webdriver_support/selenium.webdriver.support.expected_conditions.html).

We'll use the `presence_of_element_located` function which returns a predicate that will make the webdriver wait until that element is present in DOM. It takes a locator argument, which is just a tuple of the locator strategy and the locator value.

```py
wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".wordCount > div:nth-child(2)")))
```

Waiting until the elements are present, and in a desired state before interacting with them is always a good idea.

{{< alert type="danger" >}}
Do NOT ever use implicit and explicit waits together in a script. They lead to unpredictable behavior.
{{< /alert >}}

{{<vs 1>}}

Whoops, that was a lot of theory. Let's take a look at code accumulated so far. It should open the monkeytype website, click on the "reject non-essential" button, select words mode and 25 words.

```py
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
import selenium.webdriver.support.expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException

driver = webdriver.Firefox()
driver.get("https://monkeytype.com")

print("clicking reject all")
rejectbutton = driver.find_element(By.CSS_SELECTOR, "button.rejectAll")
rejectbutton.click()

print("selecting words -> 25")
words_btn = driver.find_element(By.CSS_SELECTOR, "div.mode > div:nth-child(2)")
words_btn.click()

wait = WebDriverWait(driver, timeout=10, poll_frequency=.5, ignored_exceptions=errors)
wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".wordCount > div:nth-child(2)")))

words_btn = driver.find_element(By.CSS_SELECTOR, ".wordCount > div:nth-child(2)")
words_btn.click()
```

Finally, we just need to simulate typing into the monkeytype website.

```py
from time import sleep
sleep(2)
print("writing into input")

prompt = driver.find_element(By.CSS_SELECTOR, "input#wordsInput")
words = driver.find_elements(By.CSS_SELECTOR, "div.word")
for word in words:
    text = "".join([w.text for w in word.find_elements(By.TAG_NAME, "letter")])
    text = text.strip()
    prompt.send_keys(f"{text} ")

input("press enter to exit")
driver.quit()
```

First of all, I'm doing a dirty practice here by sleeping two seconds instead of using explicit waits.
Yeah I will not justify using it. 

The code finds the `input` element and stores it in the `prompt` variable. To simulate typing into the input, we can use the `send_keys('text')` method on `prompt`.

Next, we need to find the words. Similar to the `find_element` function, `find_elements` function returns a list of all the elements it could find by the locator. This is because each word on monkeytype is defined like this:
```html
<div class="word active">
  <letter>l</letter>
  <letter>i</letter>
  <letter>k</letter>
  <letter>e</letter>
</div>
```

Once we've grabbed all the words, we need to construct the word by joining the text inside all `letter` tags. We do it by looping over the `word` container, then inside each `word`, we call `find_elements` for letter tags and grab its inner text. After combining all the letters, we remove all the whitespaces just in case. Finally, we call the `send_keys` function to type the constructed word and a space (!important).

The `driver.quit()` method closes the browser window. We're waiting for user input before quitting so you can admire the typing speed you can never achieve.


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
