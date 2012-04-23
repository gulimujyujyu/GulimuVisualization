GulimuVisualization
===================

#. Introduction

This is the portofolio about visualization on the web.

The project is host in [github](https://github.com/gulimujyujyu/GulimuVisualization)

#. How to run it

> For more details, please go to Google App Engine's Developer site.

1. Download [Python 2.7](http://www.python.org/download/releases/2.7.3/).
2. Download [GAE SDK for python](https://developers.google.com/appengine/downloads#Google_App_Engine_SDK_for_Python)
3. run by `{google_appengine_path}/dev_appserver.py GulimuVisualization/`

##. Sina Weibo

For local runtime of Sina weibo visualization, it requires a small modification.

1. go to `{window_path}/system32/drivers/etc/hosts`
2. add a new line `127.0.0.1 viz.gulimujyujyu.me`
3. open a browser, and type in `viz.gulimujyujyu.me:8080/weibo`