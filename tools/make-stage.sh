#!/bin/bash
key=/tmp/staging-secret
cat > $key << ENDL
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAqAQJEtZdJUqiTtQtee0LOICYsZVWZEXv9qrXGCoHu9tNaog+
sBbVOMJPdqOb6AXbwGFmEJCLKueZF1UC1wxnl1kkgsG8ZHMdFMRkI3vYIsNudDRx
mEXF/0rxe/UHRNddtrfxM8xE5/fpP5mzgl/gmKeumdRc/NXZ/l3no0iaxsoKOQ7K
mdZhvEohhIPFU2oTKNN4PSt1A1LsAi8zoqWUhzEB+TGKLLarNCIUi5oy4l4A67zk
t4VYihLsaeDuK1UoyWKpK+T1a/ampd1G3lOv7mTetc4HpoEemnIVu0gRPSUzewp9
v1PH7M5eMjLM2e35UCPkwbDrqnKQTLYx+7igsQIDAQABAoIBADtqcer/c6Eka5GE
5zAe68DneRgTv6FmOh34/GfHNUTxoMbzt3d+G5ke3gsOgKvkpnm59+YTt6NMk470
uTRjZp7XH1o+OOks7DPT37XMrfpdMkpV4XX/9qz5S7ySQifOIY3kLqAqtJNz0EB1
kk2gqkRRyCUOPHQNDDIv8yKDInj5lzZ0XPaLrkRZXeoGp5ynOsH9z9zjucLlwpcV
oLdKti+sNpvkERR3slQTuiM2WF7dLRweyyCOKvXkn0IXfGMMr1/f0fsN+BJKS83A
ofC7/V+d41h0wOTnlUhMNn4UNXOgZlR9fK2EPo8WG0v/cr2dVdQbh7P2qTNZD39j
200nMAECgYEA1TDTWDwhaQ45iuIjZAqwsc/dgxgZNCPVwgTb0+3LBQ/TLUPxFTMT
0N62YUZAGVdOUhDwkDRb0eivCuLCrHdEWPGB5hQ4/9+HLmXO0gw/89iXY6moEna3
zaYip+v5K1yU+N2yBGmOAsVMMdkYkn+9kv2dTWNfHlDoZiomxg51F+ECgYEAycD3
/Bk3FU+EDzfX7D/P1QG8aPbnaQHH3LP6eoQJguRL/+sgUx/j/itKfnBhqOffvns6
4sp11h26P0y4pq3ePTEMqP4LtvtPadiHhdxDHtcGnx6drjWdBSLzoPL6jnvZMt9m
9AtEzBk61aLyegJZ5O/N8zAIfRcQAnP/cQp8YtECgYAhuG1VYX1vXn6fhxFN+5rj
JRvGZoNmCdz/qUEUDmK0VEJ0wHBbiA60VOXIERKGb5bFyEQkqwNy+jjloeRk3yCC
aQDA4aX6YuLA5f2Gn8VlznZznxwkf36nGoYUxXBN+YDetEI6DHAX5BkfMVV/ppDX
tSGyYetjoiyALF6hqRvAQQKBgQCigmn9yX3CD6Oq8mtdY+UPiW9vCPpLbeDEGMC4
sORMZ4IEKSuHaVenYs2FXRZ9DBEAiJhdF4GlL5rW5ACUWdZ6aajt8nwTLwi/lGdN
Xqc+DyvJPcr7CTpqacXeLfm+jWndfW+bQfxvfh8S+EbiGkS4kKTOrzEXOV1u7Gqk
bjLVEQKBgFr5AptuldcA2OOOciCEpVz7+xg5kjl1UR1IMeD42HmOALHL1pLCfFD7
DwDVHGJiJRFXwEJZ3H6/xOuqVJgOM4nWOLq0kB4z3XDTqMav0PNPeVv2NmhQRICv
yBlBCx7EjiT3JyPRlGx71kJTpnk7H8u+RcqEtdlEHCAM+l3GpqB3
-----END RSA PRIVATE KEY-----
ENDL

chmod 0600 $key

[ -e /tmp/.make-stage-pid ] && kill `cat /tmp/.make-stage-pid`
ssh -i $key waiver@45.79.111.50 "pkill -o -u waiver sshd"
ssh -i $key -NC -R 45.79.111.50:4300:0.0.0.0:3080 waiver@45.79.111.50 &
echo $! > /tmp/.make-stage-pid