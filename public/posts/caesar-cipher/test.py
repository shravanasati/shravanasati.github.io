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


# if __name__ == "__main__":
#     cipher = CaesarCipher()
#     text = "Caesar Cipher isn't useful at all nowadays. It can be easily broken."
#     encrypted = cipher.encrypt(text)
#     print(encrypted)
#     decrypted = cipher.decrypt(encrypted)
#     print(decrypted)

import heapq
import string
# from ciphers import CaesarCipher
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