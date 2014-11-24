---
layout: post
title: Testing Posts
category: Code

excerpt: Quick overview on how to post code in your blog entries. 

---

Whenever you need to post a code snippet, use the liquid tags `highlight` and `endhighlight` like this:

{% highlight python %}
# some code goes here
print "test"
{% endhighlight %}

Note that this only provides color-coding. For that you might need to use a front end colorization engine like Highlight.JS or something similar.
