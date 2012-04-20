# -*- coding:utf-8 -*-

__author__ = 'xlzhu'

import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

import settings as GLOBAL_SETTINGS
from lib.weibo import weibo

import webapp2
import logging
import json
import re
import math
from django.template import loader as django_loader
from google.appengine.api import urlfetch

client = weibo.APIClient(app_key=GLOBAL_SETTINGS.WEIBO_KEY, app_secret=GLOBAL_SETTINGS.WEIBO_SECRET)
MONTHS = {
  'jan':1,
  'feb':2,
  'mar':3,
  'apr':4,
  'may':5,
  'jun':6,
  'jul':7,
  'aug':8,
  'sep':9,
  'oct':10,
  'nov':11,
  'dec':12
}

class MainPage(webapp2.RequestHandler):
  def get(self):

    #step 1: get authorized token
    client.redirect_uri = self.request.uri
    url_authorize = client.get_authorize_url()

    #step 2:
    request_code = self.request.get('code')
    access_token = None
    expires_in = None
    if request_code:
      res = client.request_access_token(code=request_code)
      access_token =  res.access_token
      expires_in = res.expires_in
      client.set_access_token(access_token=access_token, expires_in=expires_in)

    template_values= {
      'oauth2_auth_url': url_authorize,
      'oauth2_access_token': access_token,
      'oauth2_expires_in': expires_in
    }

    logging.info("/weibo:\t%s" % (url_authorize))

    self.response.out.write(django_loader.render_to_string('weibo_mainpage.html', template_values))

class ResultPage(webapp2.RequestHandler):
  def get(self):
    template_values= {}

    access_token = self.request.get('access_token')
    expires_in = self.request.get('expires_in')
    page = self.request.get('page')

    if access_token:
      client.set_access_token(access_token=access_token,expires_in=expires_in)
      if page == '':
        res = client.get.statuses__user_timeline(count=100)
      else:
        res = client.get.statuses__user_timeline(count=100,page=page)
      timeline = []

      if res['total_number'] > 0:
        timeline[len(timeline):] = (res.statuses)
        i=1 if page=='' else page
        logging.info("/weibo:\t%s:%d" % (i,len(res.statuses)))
        if page == '':
          for i in range(2, int(math.ceil(float(res['total_number'])/float(len(res.statuses))))+1):
            res = client.get.statuses__user_timeline(count=100,page=i)
            timeline[len(timeline):] = (res.statuses)
            logging.info("/weibo:\t%d:%d" % (i,len(res.statuses)))

      logging.info("/weibo:\t%s:%s" % ('total_number',res['total_number']))
      logging.info("/weibo:\t%s:%s" % ('next_cursor',res['next_cursor']))
      logging.info("/weibo:\t%s:%s" % ('previous_cursor',res['previous_cursor']))

      template_values['weibo_json'] = json.dumps(timeline)

      for i in range(0,len(timeline)):
        tm = timeline[i]['created_at']
        #Thu Apr 19 23:43:02 +0800 2012
        match = re.search(r'(\w+)\s(\w+)\s(\d+)\s(\d+):(\d+):(\d+)\s(\S+)\s(\d+)', tm.encode('ascii','ignore'))
        if match:
          yy = int(match.group(8))
          mm = MONTHS[str.lower(match.group(2))]
          dd = int(match.group(3))
          #logging.info("/weibo:\t(yy,mm,dd):(%04d,%02d,%02d)" % (yy,mm,dd))
          timeline[i]['day_key'] = '%04d-%02d-%02d' % ( yy, mm, dd)
          timeline[i]['month_key'] = '%04d-%02d' % ( yy, mm)
          timeline[i]['year_key'] = '%04d' % yy

      template_values['weibo_list'] = timeline

    self.response.out.write(django_loader.render_to_string('weibo_result.html', template_values))

class CalendarPage(webapp2.RequestHandler):
  def get(self):
    template_values = {}
    self.response.out.write(django_loader.render_to_string('weibo_calendar.html', template_values))

app = webapp2.WSGIApplication([('/weibo/?',MainPage),
  ('/weibo/result',ResultPage),
  ('/weibo/calendar',CalendarPage)],
  debug=True)