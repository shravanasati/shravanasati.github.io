---
title: "Understanding and breaking the Caesar cipher"
date: 2024-08-17T17:52:02+05:30
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

Now things get interesting. The idea behind breaking the cipher, without knowing the shift is easy - we know that there are only 26 possible shifts. We can brute-force through all the shifts very quickly and determine which sentence looks like actual English, and not just some random mumblings.

```python
class CaesarDecipher:
    def __init__(self, ciphered_text: str) -> None:
        self.ciphered_text = ciphered_text

    def decipher(self):
        # brute force through all shifts
        for shift in range(1, 27):
            print(shift, CaesarCipher(shift).decrypt(self.ciphered_text))

if __name__ == "__main__":
    text = "Caesar Cipher isn't useful at all nowadays. It can be easily broken."
    enc = CaesarCipher(21).encrypt(text)
    CaesarDecipher(enc).decipher()
```

{{< vs 1 >}}

This works, but looking through all those shifted texts is still a pain. What if we could come up with a method to show, maybe the 5 most senseful transformations?

Enter frequency analysis.

The English language is biased towards certain letters. Those letters appear more often than their peers.
Prime examples of such letters are `e`, `t`, `a`, `o` and so on. This cipher, by shifting the letters, also shifts their usage proportions.

{{< img src="/posts/caesar-cipher/bar_chart.png" title="an image depicting a bar graph of english letter usage" >}}

{{< vs 1 >}}

This bar chart shows the percentage appearance of each letter in English texts. When the caesar cipher is applied, this chart is also translated sideways by the amount of shift.

Thus, we need to find the shift in the chart (i.e., usage proportions), and by reversing the shift we'll arrive at the original text.

Let's code that now.


```python
import heapq
import string
from ciphers import CaesarCipher
import scipy.stats


class CaesarDecipher:
    def __init__(self, ciphered_text: str) -> None:
        self.ciphered_text = ciphered_text
        # taken from https://norvig.com/mayzner.html
        self.freq_table = {
            "e": 12.49,
            "t": 9.28,
            "a": 8.04,
            "o": 7.64,
            "i": 7.57,
            "n": 7.23,
            "s": 6.51,
            "r": 6.28,
            "h": 5.05,
            "l": 4.07,
            "d": 3.82,
            "c": 3.34,
            "u": 2.73,
            "m": 2.51,
            "f": 2.40,
            "p": 2.14,
            "g": 1.87,
            "w": 1.68,
            "y": 1.66,
            "b": 1.48,
            "v": 1.05,
            "k": 0.54,
            "x": 0.23,
            "j": 0.16,
            "q": 0.12,
            "z": 0.09,
        }

    @staticmethod
    def get_frequency_distribution(s: str):
        table_count: dict[str, int] = {c: 0 for c in string.ascii_lowercase}
        for char in s:
            if char.isalpha():
                table_count[char.lower()] += 1

        total = sum(table_count.values())
        table_freq = {k: v / total * 100 for k, v in table_count.items()}
        return table_freq

    def decipher(self, threshold: int):
        shifted_ciphers: list[str] = []

        # brute force through all shifts
        for shift in range(1, 27):
            shifted_ciphers.append(CaesarCipher(shift).decrypt(self.ciphered_text))

        # perform frequency analysis using chi square method
        chi_table: dict[str, float] = {}
        expected_dist = list(self.freq_table.values())
        expected_sum = sum(expected_dist)

        for sentence in shifted_ciphers:
            observed_dist = list(self.get_frequency_distribution(sentence).values())
            observed_sum = sum(observed_dist)
            # normalize observed distribution
            observed_dist = [x * (expected_sum / observed_sum) for x in observed_dist]
            chi_square, p_value = scipy.stats.chisquare(
                f_obs=observed_dist, f_exp=expected_dist
            )
            chi_table[sentence] = chi_square * (1 - p_value)

        return [
            i[0]
            for i in heapq.nsmallest(
                min(max(threshold, 1), 26), chi_table.items(), key=lambda item: item[1]
            )
        ]


if __name__ == "__main__":
    text = """
    This bar chart shows the percentage appearance of each letter in English texts.
    When the caesar cipher is applied, this chart is also translated sideways by the amount of shift.
    Thus, we need to find the shift in the chart (i.e., usage proportions), and by reversing the shift
    we'll arrive at the original text.
    """.strip()
    ciphered = CaesarCipher(13).encrypt(text)
    print(ciphered)
    threshold = 3
    print("Top {} picks:".format(threshold))
    for i, pick in enumerate(CaesarDecipher(ciphered).decipher(threshold)):
        print(i + 1, pick)
        print("\n--------\n")
```

{{< vs 1 >}}

Let's break it piece-by-piece.

```python
    def __init__(self, ciphered_text: str) -> None:
        self.ciphered_text = ciphered_text
        # taken from https://norvig.com/mayzner.html
        self.freq_table = {
            "e": 12.49,
            "t": 9.28,
            "a": 8.04,
            "o": 7.64,
            "i": 7.57,
            "n": 7.23,
            ...
```

This is the frequency table for the English language, which would be our expected distribution. These values add up to *almost* 100%.

```python
    @staticmethod
    def get_frequency_distribution(s: str):
        table_count: dict[str, int] = {c: 0 for c in string.ascii_lowercase}
        for char in s:
            if char.isalpha():
                table_count[char.lower()] += 1

        total = sum(table_count.values())
        table_freq = {k: v / total * 100 for k, v in table_count.items()}
        return table_freq
```

This is a helper function which generates a frequency distribtion table from the given text. We're just counting the number of each character, and then converting them into percentages. Note how we've converted each alphabetic character to lower case, to compare them against our expected frequency distribution.

```python
    def decipher(self, threshold: int):
        shifted_ciphers: list[str] = []

        # brute force through all shifts
        for shift in range(1, 27):
            shifted_ciphers.append(CaesarCipher(shift).decrypt(self.ciphered_text))

        # perform frequency analysis using chi square method
        chi_table: dict[str, float] = {}
        expected_dist = list(self.freq_table.values())
        expected_sum = sum(expected_dist)
        ...
```

We're starting out with the same brute-force logic, but accumulating those transformed sentences instead of printing them. 

Now, for frequency analysis, we would be comparing each shifted sentence's frequency distribution to the *expected* frequency distribution. To compare how close those distributions are, we would be employing the [chi-squared test](https://en.wikipedia.org/wiki/Chi-squared_test).

Without going into much detail of what it is, it returns two numbers, the chi-squared statistic and the p-value. The lower the first number is, the better fit is the observed distribution with the expected distribution. The higher the second number is, the less indifference is between the two distributions. We will generate a combined score from both those numbers as such:

$$
 score  = \chi^2 * (1 - p)
$$

After we've calculated the score for all the transformations, we'll sort them according to their score, and return, for example, the 5 transformations with the smallest scores. That's what the rest of the code does.

```python
        ...
        for sentence in shifted_ciphers:
            observed_dist = list(self.get_frequency_distribution(sentence).values())
            observed_sum = sum(observed_dist)
            # normalize observed distribution
            observed_dist = [x * (expected_sum / observed_sum) for x in observed_dist]
            chi_square, p_value = scipy.stats.chisquare(
                f_obs=observed_dist, f_exp=expected_dist
            )
            chi_table[sentence] = chi_square * (1 - p_value)

        return [
            i[0]
            for i in heapq.nsmallest(
                min(max(threshold, 1), 26), chi_table.items(), key=lambda item: item[1]
            )
        ]
```

The `decipher` method takes a `threshold` parameter, which indicates how many sentences we need to return. According to my tests, larger sentences, like in the example below are usually the first pick. Shorter sentences often fail because of the lack of enough characters. To combat that, increase the `threshold` parameter. 

```python
if __name__ == "__main__":
    text = """
    This bar chart shows the percentage appearance of each letter in English texts.
    When the caesar cipher is applied, this chart is also translated sideways by the amount of shift.
    Thus, we need to find the shift in the chart (i.e., usage proportions), and by reversing the shift
    we'll arrive at the original text.
    """.strip()
    ciphered = CaesarCipher(13).encrypt(text)
    print(ciphered, "\n")
    threshold = 3
    print("Top {} picks:".format(threshold))
    for i, pick in enumerate(CaesarDecipher(ciphered).decipher(threshold)):
        print(i + 1, pick)
        print("\n--------\n")
```

Here's the output:

```
Guvf one puneg fubjf gur crepragntr nccrnenapr bs rnpu yrggre va Ratyvfu grkgf. Jura gur pnrfne pvcure vf nccyvrq, guvf puneg vf nyfb genafyngrq fvqrjnlf ol gur nzbhag bs fuvsg. Guhf, jr arrq gb svaq gur fuvsg va gur puneg (v.r., hfntr cebcbegvbaf), naq ol erirefvat gur fuvsg jr’yy neevir ng gur bevtvany grkg.

Top 3 picks:
1 This bar chart shows the percentage appearance of each letter in English texts. When the caesar cipher is applied, this chart is also translated sideways by the amount of shift. Thus, we need to find the shift in the chart (i.e., usage proportions), and by reversing the shift we’ll arrive at the original text.

--------

2 Uijt cbs dibsu tipxt uif qfsdfoubhf bqqfbsbodf pg fbdi mfuufs jo Fohmjti ufyut. Xifo uif dbftbs djqifs jt bqqmjfe, uijt dibsu jt bmtp usbotmbufe tjefxbzt cz uif bnpvou pg tijgu. Uivt, xf offe up gjoe uif tijgu jo uif dibsu (j.f., vtbhf qspqpsujpot), boe cz sfwfstjoh uif tijgu xf’mm bssjwf bu uif psjhjobm ufyu.

--------

3 Guvf one puneg fubjf gur crepragntr nccrnenapr bs rnpu yrggre va Ratyvfu grkgf. Jura gur pnrfne pvcure vf nccyvrq, guvf puneg vf nyfb genafyngrq fvqrjnlf ol gur nzbhag bs fuvsg. Guhf, jr arrq gb svaq gur fuvsg va gur puneg (v.r., hfntr cebcbegvbaf), naq ol erirefvat gur fuvsg jr’yy neevir ng gur bevtvany grkg.

--------
```

{{< vs 2 >}}

While I was working on this, I discovered a website called [boxentriq](https://www.boxentriq.com/code-breaking/caesar-cipher). It works even for small sentences. They've not shared their implementation, but their scores are much more better for actual sentences compared to incorrect ones. I assume some NLP is at play.

Anyway, that's all for this blog. If you want to explore some more ciphers, take a look at the Vigenere cipher, one-time pad cipher & the enigma machine.