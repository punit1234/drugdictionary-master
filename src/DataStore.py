'''
Created on Sep 16, 2013

@author: will
'''
import datetime
import hashlib
import random
import string
from google.appengine.ext import db

class Drug(db.Model):
    #-------------------------------------------------------------------------
    #identifier
    generic_name = db.StringProperty(required=True)
    brand_name = db.StringProperty()
    #general info
    info_link = db.StringProperty()
    #-------------------------------------------------------------------------
    #storage
    how_supplied_storage_prior = db.TextProperty()
    #-------------------------------------------------------------------------
    #reconstruction
    reconstitution_concentration = db.TextProperty()
    stability_post_reconstruction = db.TextProperty()
    vehicle_dilution = db.TextProperty()
    #-------------------------------------------------------------------------
    #administration
    administration = db.TextProperty()
    #-------------------------------------------------------------------------
    #random
    misc_notes = db.TextProperty()
    references = db.TextProperty()
    black_box = db.TextProperty()
def save_drug(mod_hash,
              brand_name,
              generic_name,
              how_supplied_storage_prior,
              reconstitution_concentration,
              stability_post_reconstruction,
              vehicle_dilution,
              administration,
              misc_notes,
              references,
              black_box):
    q = User.gql("WHERE mod_hash = '%s'" % mod_hash)
    user = q.get();
    if(user):
        if not user.group == 'admin':
            return {'type':'error',
                    'error':'not authorized',
                    'generic_name':generic_name,
                    'status':'rejected'}
    else:
        return {'type':'error',
                'error':'must login first',
                'generic_name':generic_name,
                'status':'rejected'}
    
    q = Drug.gql("WHERE generic_name = '%s'" % generic_name)
    drug = q.get()
    if drug == None:
        #Drug not found, create a new one
        drug = Drug(generic_name=generic_name)

    drug.brand_name = brand_name
    drug.how_supplied_storage_prior = how_supplied_storage_prior
    drug.reconstitution_concentration = reconstitution_concentration
    drug.stability_post_reconstruction = stability_post_reconstruction
    drug.vehicle_dilution = vehicle_dilution
    drug.administration = administration
    drug.misc_notes = misc_notes
    drug.references = references
    drug.black_box = black_box
    drug.put()
    return {'generic_name':generic_name,
            'status':'saved'}
    
def drug_list():
    q = Drug.gql("ORDER BY generic_name ASC")
    drugs = q.fetch(500, 0)
    data = []
    
    for drug in drugs:
        drug_obj={'brand_name':drug.brand_name,
                  'generic_name':drug.generic_name,
                  'generic_name':drug.generic_name,
                  'how_supplied_storage_prior':drug.how_supplied_storage_prior,
                  'reconstitution_concentration':drug.reconstitution_concentration,
                  'stability_post_reconstruction':drug.stability_post_reconstruction,
                  'vehicle_dilution':drug.vehicle_dilution,
                  'administration':drug.administration,
                  'misc_notes':drug.misc_notes,
                  'references':drug.references,
                  'black_box':drug.black_box}
        data += [drug_obj]
    ret = {'type':'list',
           'data':data}
    return ret
        

class User(db.Model):
    username = db.StringProperty(required=True)
    password = db.StringProperty(required=True)
    group = db.CategoryProperty(default="view_all", choices=["view_all", "admin"])
    email = db.EmailProperty()
    mod_hash = db.StringProperty()

def user_list(username,mod_hash):
    
    q = User.gql("WHERE username = '%s' AND mod_hash = '%s'" % (username,mod_hash))
    user = q.get();
    if(user):
        if user.group == 'admin':
            q = User.gql("ORDER BY username ASC")
            users = q.fetch(500)
            ret = []
            for u in users:
                ret += [{'username':u.username,
                         'group':u.group,
                         'email':u.email}]
            ret = {'type':'list',
                   'data':ret}
            return ret
        else:
            return {'type':'error',
                    'error':'not authorized'}
    else:
        return {'type':'error',
                'error':'must login first'}
    
def hash(password):
    m = hashlib.sha1()
    m.update(password)
    return m.hexdigest()

def validate(username,password=False,mod_hash=False,get_user=False):
    if mod_hash:
        #validate user's mod_hash
        qry = "WHERE username = '%s' AND mod_hash = '%s'" % (username,mod_hash)
        
        q = User.gql(qry)
        result = q.get()
        if not result == None:
            if get_user:
                return {'type':'logged in',
                    'mod_hash':mod_hash,
                    'username':username,
                    'user':result}
            else:
                return {'type':'logged in',
                        'mod_hash':mod_hash,
                        'username':username}
        elif not password:
            return {'type':'error',
                    'error':'must login first'}
    #validate username & password
    print 'username: %s' % username
    q = User.gql("WHERE username = '%s'" % username)
    result = q.get()
    if not result == None:
        print 'mod_hash: %s' % result.mod_hash
        if result.password == hash(password):
            mod_hash = create_modhash()
            result.mod_hash = mod_hash
            result.put()
            if get_user:
                return {'type':'logged in',
                    'mod_hash':mod_hash,
                    'username':username,
                    'user':result}
            else:
                return {'type':'logged in',
                        'mod_hash':mod_hash,
                        'username':username}
        else:
            return {'type':'error',
                    'error':'username/password invalid'}
    else:
        #user not found, might as well return True
        return {'type':'error',
                'error':'username invalid'}

def get_info(username,mod_hash):
    valid = validate(username=username,
                     mod_hash=mod_hash,
                     get_user=True)
    if valid['type']=='logged in':
        return {'type':'info',
                'group':valid['user'].group,
                'username':valid['username'],
                'email':valid['user'].email}
    else:
        return valid

def register_user(username,password,email):
    q = User.gql("WHERE username = '%s'" % username)
    result = q.get()
    if not result == None:
        return {'type':'error',
                'error':'username taken'}
    new_user = User(username = username,
                    password = hash(password))
    mod_hash = create_modhash()
    new_user.mod_hash = mod_hash
    new_user.email = email
    new_user.put()
    return {'type':'registered',
            'username':username,
            'mod_hash':mod_hash}
def reset_password(username,mod_hash,user):
    val = validate(username=username,
                   mod_hash=mod_hash,
                   get_user=True)
    if (val['type']=='logged in' and
        val['user'].group=='admin'):
        q = User.gql("WHERE username = '%s'" % user)
        result = q.get()
        if result == None:
            return {'type':'error',
                    'error':'unknown user'}
        else:
            default_password = 'password'
            result.password = hash(default_password)
            result.mod_hash = create_modhash()
            result.put()
            return {'type':'password reset',
                    'user':user,
                    'password':default_password}
    elif (val['type']=='error'):
        return val
    else:
        return {'type':'error',
                'error':'must be admin to reset password'}
def change_password(username,password,new_password):
    val = validate(username=username,
                   password=password,
                   get_user=True)
    if val['type']=='logged in':
        user = val['user']
        user.password = hash(new_password)
        user.mod_hash = create_modhash()
        user.put()
        return {'type':'password changed',
                'username':username,
                'mod_hash':user.mod_hash}
    else:
        return {'type':val['type'],
                'error':val['error']}
def delete_user(username,mod_hash,user):
    val = validate(username=username,
                   mod_hash=mod_hash,
                   get_user=True)
    if (val['type']=='logged in' and
        val['user'].group=='admin'):
        q = User.gql("WHERE username = '%s'" % user)
        result = q.get()
        if result == None:
            return {'type':'error',
                    'error':'unknown user'}
        else:
            result.delete()
            return {'type':'user deleted',
                    'user':user}
    else:
        return {'type':'error',
                'error':'must be admin to reset password'}
def change_group(username,mod_hash,user,group):
    val = validate(username=username,
                   mod_hash=mod_hash,
                   get_user=True)
    if (val['type']=='logged in' and
        val['user'].group=='admin'):
        q = User.gql("WHERE username = '%s'" % user)
        result = q.get()
        if result == None:
            return {'type':'error',
                    'error':'unknown user'}
        else:
            result.group=group
            result.put()
            return {'type':'group changed',
                    'user':user,
                    'group':group}
    else:
        return {'type':'error',
                'error':'must be admin to change groups'}
def create_modhash():
    size=24
    chars=string.ascii_uppercase +string.ascii_lowercase + string.digits
    r = ''.join(random.choice(chars) for x in range(size))
    return r 


class DrugKey(db.Model):
    keyname = db.StringProperty(required=True)
    value = db.StringProperty(required=True)

def drug_key_list():
    q = DrugKey.gql("ORDER BY key ASC")
    DrugKeys = q.fetch(500, 0)
    data = []
    
    for dk in DrugKeys:
        drug_obj={'key':dk.keyname,
                  'value':dk.value}
        data += [drug_obj]
    ret = {'type':'list',
           'data':data}
    return ret

def save_drug_key(key,value):
    dk = DrugKey(keyname=key,value=value)
    dk.put()
    return {'status':'saved',
            'key':key}
    