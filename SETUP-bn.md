# ব্যাকএন্ড চালু করার ধাপ (Cloudflare Pages)

ফাইলগুলো GitHub রিপোর **রুটে** (index.html যেখানে আছে সেখানে) আপলোড করুন, `functions` ও `db` ফোল্ডার সহ।

## ১. D1 ডাটাবেস
1. Cloudflare → **Storage & databases → D1 SQL database → Create database** (নাম: `snk3d-db`)
2. **Console** ট্যাবে `db/schema.sql` এর লেখা পেস্ট করে **Execute** চাপুন।

## ২. R2 (ছবির জন্য)
1. **Storage & databases → R2 → Create bucket** (নাম: `snk3d-images`)
   (R2 চালু করতে পেমেন্ট মেথড দিতে হতে পারে; ফ্রি সীমার মধ্যে চার্জ লাগে না)

## ৩. Pages প্রজেক্টে যুক্ত করা
Pages প্রজেক্ট → **Settings**:
1. **Bindings → Add → D1 database**: নাম `DB`, ডাটাবেস `snk3d-db`
2. **Bindings → Add → R2 bucket**: নাম `IMAGES`, বাকেট `snk3d-images`
3. **Variables and secrets → Add**: নাম `ADMIN_PASSWORD`, টাইপ **Secret**, মান = আপনার শক্ত পাসওয়ার্ড (১২+ অক্ষর)
4. **Deployments → Retry deployment** (বা GitHub-এ নতুন commit করুন)

নামগুলো ঠিক `DB`, `IMAGES`, `ADMIN_PASSWORD` হতে হবে (বড় হাতের অক্ষর)।

## ৪. ব্যবহার
1. `আপনার-সাইট/admin.html` খুলে পাসওয়ার্ড দিন।
2. **+ নতুন প্রজেক্ট** চেপে সেভ করুন, সাথে সাথে সাইটে চালু হবে।
3. পুরনো প্রজেক্টগুলো আনতে admin-এ **"data.js থেকে ... আনুন"** বাটন চাপুন।
4. আনা শেষ হলে GitHub-এ `data.js` ফাইলের পুরো লেখা বদলে শুধু এটা রাখুন:
   `window.PROJECTS=[];`
   (নাহলে পুরনো প্রজেক্ট ও ছবি `data.js` থেকে সবার জন্য খোলা থাকবে)
