import json, sys, urllib.request

API_URL = "https://peakerr.com/api/v2"
API_KEY = "c7e71376ea65956e31f386da479fa163"
UZS_RATE = 12800
MARKUP = 2.5

data = urllib.request.urlopen(urllib.request.Request(
    API_URL, data=f"key={API_KEY}&action=services".encode(),
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)).read()
services = json.loads(data)

categories = {}
for s in services:
    cat = s["category"]
    if cat not in categories:
        categories[cat] = []
    categories[cat].append(s)

print(f"Peakerr Balance: $10.00")
print(f"Total services: {len(services)}")
print(f"Markup: {MARKUP}x ({int((MARKUP-1)*100)}% profit)")
print()

for keyword, label in [
    ("Telegram - Members", "TELEGRAM OBUNACHILAR"),
    ("Telegram - Views", "TELEGRAM KO'RISHLAR"),
    ("Instagram Followers", "INSTAGRAM FOLLOWERS"),
    ("Instagram Likes", "INSTAGRAM LIKES"),
    ("YouTube - Subscribers", "YOUTUBE OBUNACHILAR"),
    ("TikTok - Followers", "TIKTOK FOLLOWERS"),
]:
    matches = []
    for cat, svcs in categories.items():
        if keyword.lower() in cat.lower():
            matches.extend(svcs)
    matches.sort(key=lambda x: float(x["rate"]))

    print(f"=== {label} (top 3 eng arzon) ===")
    for s in matches[:3]:
        rate = float(s["rate"])
        sell_price = rate * UZS_RATE * MARKUP
        profit = sell_price - (rate * UZS_RATE)
        print(f"  ${rate:.4f}/1K | Sotish: {sell_price:,.0f} so'm/1K | Foyda: {profit:,.0f} so'm | Min:{s['min']} | {s['name'][:50]}")
    print()
