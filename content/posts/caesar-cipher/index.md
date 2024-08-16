---
title: "Understanding and breaking the Caesar cipher"
date: 2024-08-16T18:00:02+05:30
description: Caesar cipher is classic substitution cipher. We will learn how to encrypt text using it, and how to break it without knowing the shift.
menu:
  sidebar:
    name: Caesar Cipher
    identifier: caesar-cipher
    weight: 30
author:
  name: Shravan Asati
  image: /images/author/shravan.png
math: true
hero: hero.jpg
draft: true
---

The caesar cipher is one the oldest known ciphers known to mankind. As the story goes, the Roman emperor Julius Caesar used it extensively for military communications. It is a simple [substitution cipher](https://en.wikipedia.org/wiki/Substitution_cipher) and is not fit for any modern usage, since it is a trivial task to break it. However, it may be worthwhile to learn the roots of cryptography, as this cipher leads to more advanced ones like the Vigènere cipher and the unbreakable one-time pad cipher. We'll learn how to implement Caesar cipher in Python, and how to break it without knowing the shift involved, using frequency analysis and some statistics. That being said, I am neither a cryptanalyst nor a statistician, so pardon me for any mistakes.

## Theory

Let's first understand how the Caesar cipher actually works. Let the text we need to encrypt be `hello world`. If we assume the shift to be 3, we need to replace each character with a character which is 3 offsets ahead in the alphabets. 

So, this is show each character will be transformed.

```
h (+3) -> k
e (+3) -> h
l (+3) -> o
l (+3) -> o
o (+3) -> r
  
w (+3) -> z
o (+3) -> r
r (+3) -> u
l (+3) -> o
d (+3) -> g
```

{{< vs 1 >}}

It is very simple - all it doing is shifting the characters. If we encounter the end of the alphabets, i.e., `z`, we circle around and continue from `a`.

{{< img src="/posts/caesar-cipher/theory.png" title="an image visualizing caesar cipher" >}}

{{< vs 1 >}}

> *Image Credits: GeeksForGeeks*

The formula is essentially: 
$$
 C = (p + shift)  mod  (26)
$$

where,

`C` is the ciphered character,

`p` is the character that needs to be ciphered,

`shift` is the amount of shfit.

## Implementation

Now let's dive into implementing this *encryption* scheme in Python.

```python
import string


class CaesarCipher:
    def __init__(self, shift: int = 11) -> None:
        self.shift = shift
        self.keys_upper = string.ascii_uppercase
        self.keys_lower = string.ascii_lowercase

    def __perform_shift(self, text: str, positive: bool) -> str:
        if positive:
            shift = self.shift
        else:
            shift = -self.shift

        shifted_text = ""

        for char in text:
            if char.isupper():
                to_consider = self.keys_upper
            elif char.islower():
                to_consider = self.keys_lower
            else:
                shifted_text += char
                continue

            index = to_consider.index(char)
            index += shift
            index %= 26

            shifted_text += to_consider[index]

        return shifted_text

    def encrypt(self, text: str) -> str:
        encrypted_text = self.__perform_shift(text, True)
        return encrypted_text

    def decrypt(self, text: str) -> str:
        decrypted_text = self.__perform_shift(text, False)
        return decrypted_text
```

{{< vs 1 >}}

That might look a little overwhelming at first, but it's quite easy once you look at it.

To summarise, we've defined a class called `CaesarCipher`, each instance of whom will work with a specific shift. Since decryption in caesar cipher is virtually the same as encryption (except we just need to shift in reverse), I've defined a single function which takes two arguments, the text to shift and and a boolean parameter named `positive` which will decide whether to shift forward or backward.

Once that's done, we loop through the given text and first determine whether each character is in upper-case or lower-case. After that, it's just a matter of using the formula mentioned above and adding the shifted character to the `shifted_text`. Also, I'm ignoring any non-alphabetic character encountered in the given text and adding it as it is.

Let's test it.

```python
if __name__ == "__main__":
    cipher = CaesarCipher()
    text = "Caesar Cipher isn't useful at all nowadays. It can be easily broken."
    encrypted = cipher.encrypt(text)
    print(encrypted)
    decrypted = cipher.decrypt(encrypted)
    print(decrypted)
```

{{< vs 1 >}}

This is the output of the program.

```
Nlpdlc Ntaspc tdy'e fdpqfw le lww yzhloljd. Te nly mp pldtwj mczvpy.
Caesar Cipher isn't useful at all nowadays. It can be easily broken.
```

## Breaking the Cipher