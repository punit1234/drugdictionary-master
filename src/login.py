'''
Created on Oct 29, 2013

@author: will
'''
import webapp2
import json

import DataStore as DB

class ajax(webapp2.RequestHandler):
    def post(self):
        content = json.loads(self.request.body)
        if ('mod_hash' in self.request.cookies and
            len(self.request.cookies['mod_hash'])>0 and
            not 'mod_hash' in content):
            mod_hash = self.request.cookies['mod_hash']
            content['mod_hash']=mod_hash
        if (not 'username' in content and 
            'username' in self.request.cookies and
            len(self.request.cookies['username'])>0):
            username = self.request.cookies['username']
            content['username']=username    
        if len(missingRequired(content,['type']))==0:
            #nothing missing, proceed
            type = content['type']
            if type in types:
                #valid type, continue
                missing = missingRequired(content,types[type]['required_fields'])
                if len(missing)==0:
                    #nothing else is missing, proceed
                    ret = types[type]['function'](content)
                    self.write(ret)
                    return
                else:
                    ret = {'error':'missing fields: '+str(missing)}
                    self.write(ret)
                    return
            else:
                ret = {'error':'invalid type: '+type}
                self.write(ret)
                return
        else:
            ret = {'error':'missing type: '}
            self.write(ret)
            return
    def get(self):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write('get:hello world')
    def write(self,obj):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(obj))
        
def missingRequired(content,required):
    missing = []
    for field in required:
        if field in content:
            continue
        else:
            missing += [field]
    return missing

def register(content):
    ret = DB.register_user(content['username'],content['password'],content['email'])
    return ret

def login(content):
    mod_hash = False
    if 'mod_hash' in content:
        mod_hash = content['mod_hash']
        
    password = False
    if 'password' in content:
        password = content['password']
        
    ret  = DB.validate(username=content['username'],
                       password=password,
                       mod_hash=mod_hash)
    return ret

def get_info(content):
    if ('mod_hash' in content and
        'username' in content):
        info = DB.get_info(username = content['username'],
                            mod_hash = content['mod_hash'])
        
        
        return info
    else:
        return {'type':'error',
                'error':'must login first'}
def reset_password(content):
    ret = DB.reset_password(username=content['username'],
                            mod_hash=content['mod_hash'],
                            user=content['user'])
    return ret
def delete_user(content):
    ret = DB.delete_user(username=content['username'],
                         mod_hash=content['mod_hash'],
                         user=content['user'])
    return ret
def change_password(content):
    ret = DB.change_password(username=content['username'],
                             password=content['password'],
                             new_password=content['new_password'])
    return ret
def change_group(content):
    ret = DB.change_group(username=content['username'],
                          mod_hash=content['mod_hash'],
                          user=content['user'],
                          group=content['group'])
    return ret
types = {'register':{'required_fields':['username','email','password'],
                   'function':register},
         'login':{'required_fields':['username'],
                  'function':login},
         'get_info':{'required_fields':[],
                      'function':get_info},
         'reset_password':{'required_fields':['username','mod_hash','user'],
                           'function':reset_password},
         'delete_user':{'required_fields':['username','mod_hash','user'],
                           'function':delete_user},
         'change_password':{'required_fields':['username','password','new_password'],
                            'function':change_password},
         'change_group':{'required_fields':['username','mod_hash','user','group'],
                            'function':change_group},}


application = webapp2.WSGIApplication([('/callback', ajax),('/login.json',ajax)], debug=True)