---
layout: post
title: The Limits of Browser Storage
description: Depends on the browser
---

With client side first apps, like Notion and Linear, the available storage on the client is crucial.
So say you're building the next Linear, how much space do you have to work with?

If you do some searching, there's a good [post from 2015 discussing the limits of IndexedDB](https://www.raymondcamden.com/2015/04/17/indexeddb-and-limits/) and I used that code as the basis for testing.

| browser     | max `localStorage` | max `IndexedDB`                        |
| ----------- | ------------------ | -------------------------------------- |
| iOS Safari  | 5MB                | 1.2GB (before prompting user for more) |
| Mac Safari  | 5MB                | 1.2GB (before prompting user for more) |
| Mac Chrome  | 5MB                | a lot! Gave up after it reached 5GB    |
| Mac Firefox | 5MB                | a lot! Gave up after it reached 5GB    |

## conclusion

`localStorage` is sufficent for small amounts of data, but if you have anything
serious, you'll probably have to use `IndexedDB`.

## code

<details>
    <summary><code>index.html</code></summary>

<!-- prettier-ignore-start -->

{% highlight html %}
<!DOCTYPE html>
<script src="storage.js"></script>
<select id="storage-option">
  <option value="localstorage">localstorage</option>
  <option value="idb">idb</option>
  <option value="memory">memory</option>
</select>
<button id="addButton">start!</button>
{% endhighlight %}

<!-- prettier-ignore-end -->

</details>

<details>
    <summary><code>storage.js</code></summary>

<!-- prettier-ignore-start -->
{% highlight js %}
// based on: https://www.raymondcamden.com/2015/04/17/indexeddb-and-limits/
const data500KB = "a".repeat(500_000)

document.addEventListener(
  "DOMContentLoaded",
  () => {
    //Listen for add clicks
    document.getElementById("addButton").addEventListener("click", main, false)
  },
  false
)

let idx = 0
let error = null

function addIDBData(db) {
  if (error != null) {
    return
  }
  idx += 1

  const transaction = db.transaction(["crap"], "readwrite")
  const store = transaction.objectStore("crap")

  log(`adding id:${idx} w/ size ${data500KB.length}...`)
  const request = store.add({
    data: data500KB
  })
  request.onerror = function (e) {
    log(`failed id:${idx}! ${e.target.error}`)
    error = e
  }
  request.onsuccess = function (e) {
    log(`added id:${idx}!`)
    addIDBData(db)
  }
}

function log(text) {
  const div = document.createElement("div")
  div.innerHTML = text
  document.body.appendChild(div)
}

function foo() {
  for (let x = 0; x++; x < 2) {
    debugger
    console.log("xxx")
  }
}

function main() {
  const selection = document.getElementById("storage-option").value
  if (selection === "localstorage") {
    while (error == null) {
      idx += 1
      log(`adding ${idx} w/ size ${data500KB.length}...`)
      try {
        localStorage.setItem(idx, data500KB)
        log(`added ${idx}!`)
      } catch (e) {
        log(`failed ${idx}! ${e}`)
        error = e
      }
    }
  } else if (selection === "idb") {
    log("connecting...")
    const openRequest = indexedDB.open("bighonkingtest", 1)
    openRequest.onupgradeneeded = function (e) {
      const thisDB = e.target.result
      console.log("running onupgradeneeded")
      if (!thisDB.objectStoreNames.contains("crap")) {
        thisDB.createObjectStore("crap", {
          keyPath: "id",
          autoIncrement: true
        })
      }
    }
    openRequest.onsuccess = function (e) {
      log("connected!")

      const db = e.target.result
      addIDBData(db)
    }
    openRequest.onerror = function (e) {
      log("error!")
    }
  } else if (selection === "memory") {
    log("memory starting...")
    let acc = []
    // 50
    for (let step = 0; step < 500; step++) {
      if (error != null) {
        break
      }
      idx += 1
      log(`adding ${idx} w/ size ${data500KB.length}...`)
      try {
        // 50 MB
        let data = new Uint8Array(1024 * 1024 * 50)
        data.fill(idx)
        acc.push(data)
        log(`added ${idx}!`)
      } catch (e) {
        log(`failed ${idx}! ${e}`)
        error = e
      }
    }
  } else {
    log("unknown...")
  }
}

{% endhighlight %}

<!-- prettier-ignore-end -->

</details>
