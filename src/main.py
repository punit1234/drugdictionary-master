'''
Created on Nov 11, 2013

@author: will
'''
import webapp2
import json

import DataStore as DB

class main(webapp2.RequestHandler):
    def post(self):
        content = json.loads(self.request.body)
        self.response.write('post:hello world')
    def get(self):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write('get:hello world')
    def write(self,obj):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write("hello world")
        
        
application = webapp2.WSGIApplication([('/', main),], debug=True)