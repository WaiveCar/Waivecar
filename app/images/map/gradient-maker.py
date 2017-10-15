#!/usr/bin/env python3
import colorsys
start = [0xe2, 0xe2, 0xe2]
end = [0x20, 0xE2, 0x5C]
grades = 4

brighter = '#20E25C'
darker = '#FFFFFF'

icon = ''
with open('icon-default.svg', 'r') as myfile:
        icon = myfile.read()

start_hsv = colorsys.rgb_to_hsv(*[x / 256 for x in start])
end_hsv = colorsys.rgb_to_hsv(*[x / 256 for x in end])

rgb2hex = lambda x: "#{:x}{:x}{:x}".format(int(x[0] * 256), int(x[1] * 256), int(x[2] * 256))

divisions = []
for y in range(0, grades + 1):
    hsv = [(end_hsv[x] - start_hsv[x]) * ((y) / grades) + start_hsv[x] for x in range(0, len(start))]
    hsv[0] = end_hsv[0]
    rgb_brighter = rgb2hex(colorsys.hsv_to_rgb(*[x for x in hsv]))
    hsv[2] *= 0.7
    rgb_darker = rgb2hex(colorsys.hsv_to_rgb(*[x for x in hsv]))
    
    with open('icon-default-{}.svg'.format(y), 'w') as myfile:
        myfile.write(icon.replace(brighter, rgb_brighter).replace(darker, rgb_darker))


