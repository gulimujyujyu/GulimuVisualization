__author__ = 'xlzhu'

import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

import webapp2
import logging
from django.template import loader as django_loader

class MainPage(webapp2.RequestHandler):
  def get(self):
    template_values = {}

    self.response.out.write(django_loader.render_to_string(
      'index.html',
      template_values
    ))

app = webapp2.WSGIApplication([('/', MainPage)],
  debug=True)