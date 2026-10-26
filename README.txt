Shah Neil Khan — পুরো সাইট (GitHub Pages)

ফোল্ডার:
  site/          = আপনার সাইট। GitHub এ শুধু এই ফোল্ডারের ভেতরের জিনিস আপলোড করবেন।
     index.html  = হোম পেজ (প্রথম পাতা)
     planner.html   = জমির মাপ + ডিজাইন স্টাইল + খরচ
     gallery.html   = ২৮৮০ স্টাইল গ্যালারি
     customize.html = নিজের ঘর সাজান
     review/        = ক্লায়েন্টের প্রজেক্ট রিভিউ
  local-admin/   = শুধু আপনার কম্পিউটারে রাখবেন। GitHub এ দেবেন না।
     admin.html ডাবল ক্লিক করে খুলুন (ইন্টারনেট লাগবে)।

GitHub এ সাইট চালু করা (কম্পিউটারে করা সহজ):
 1. github.com এ অ্যাকাউন্ট খুলুন। উপরে + > New repository চাপুন।
 2. নাম দিন (যেমন shah-neil-khan), Public বেছে নিন, Create repository চাপুন।
 3. "uploading an existing file" লিংকে চাপুন। জিপ খুলে site ফোল্ডারের ভেতরের সব (index.html, planner.html, gallery.html, customize.html, review ফোল্ডার) টেনে ফেলুন। Commit changes চাপুন।
    (.nojekyll ফাইলটা লুকানো থাকতে পারে, না থাকলেও সমস্যা নেই।)
 4. Settings > Pages > Branch: main, Folder: / (root) > Save।
 5. ১-২ মিনিট পর সাইট চালু: https://আপনার-ইউজারনেম.github.io/shah-neil-khan/
 ক্লায়েন্টের লিংক: .../review/#কোড

নতুন প্রজেক্ট যোগ:
 1. local-admin/admin.html খুলুন > + নতুন প্রজেক্ট > সেভ > "data.js ডাউনলোড"।
 2. GitHub এ site/review/data.js খুলে Edit/Upload দিয়ে নতুন data.js দিয়ে বদলান।
 3. ডাউনলোড করা data.js এর একটা কপি নিজের কাছেও রাখুন।

করার বাকি (আপনার কাজ):
 - index.html এর শেষে "যোগাযোগ" মন্তব্যের জায়গায় ফোন/ইমেইল বসান।
 - planner.html এ খরচের রেট (৳/ফুট²) আপনার এলাকার আসল রেট দিয়ে বদলান। এখনকার রেট আন্দাজ করা উদাহরণ।

সাবধান:
 - Public রিপোজিটরিতে সবাই data.js দেখতে পারে (ক্লায়েন্টের নকশা ও কোড)। গোপন কাজ এখানে রাখবেন না।
 - প্রজেক্ট কোড নিরাপত্তা নয়, শুধু আলাদা করার সুবিধা।
 - ফোন থেকে ফোল্ডার আপলোড ঝামেলার। সহজ বিকল্প: netlify.com/drop এ site ফোল্ডার টেনে ফেলা।
 - সব মডেল ধারণা-মডেল, নির্মাণের নকশা নয়।
