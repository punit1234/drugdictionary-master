'''

'''
import webapp2
import json

import DataStore as DB

class ajax(webapp2.RequestHandler):
    def post(self):
        content = json.loads(self.request.body)
        if ('mod_hash' in self.request.cookies and
            len(self.request.cookies['mod_hash'])>0):
            mod_hash = self.request.cookies['mod_hash']
            content['mod_hash']=mod_hash
        if ('username' in self.request.cookies and
            len(self.request.cookies['username'])>0):
            username = self.request.cookies['username']
            content['username']=username
            
        if len(missingRequired(content,['type']))==0:
            #type found, proceed
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
        self.response.write('GET not supported')
    def write(self,obj):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(obj))
        #self.response.write(str(obj))
def missingRequired(content,required):
    missing = []
    for field in required:
        if field in content:
            continue
        else:
            missing += [field]
    return missing

def lookup_drug(content):
    drug_name = content['drug_name']


def save_drug(content):
    status = DB.save_drug(mod_hash=content['mod_hash'],
                          brand_name=content['brand_name'], 
                          generic_name=content['generic_name'],
                          how_supplied_storage_prior=content['how_supplied_storage_prior'], 
                          reconstitution_concentration=content['reconstitution_concentration'], 
                          stability_post_reconstruction=content['stability_post_reconstruction'],
                          vehicle_dilution=content['vehicle_dilution'],
                          administration=content['administration'], 
                          misc_notes=content['misc_notes'],
                          references=content['references'],
                          black_box=content['black_box'])
    return status
def user_list(content):
    status = DB.user_list(username=content['username'],
                          mod_hash=content['mod_hash'])
    return status
                 
def drug_list(content):
    ret = DB.drug_list()
    return ret
def drug_key_list(content):
    ret = {}
    ret['data'] = DB.drug_key_list()
    return ret
def save_drug_key(content):
    ret = DB.save_drug_key(content['key'],content['value'])
    return ret
def new_drug(content):
    TODO = True
def modify_drug(content):
    TODO = True
def login(content):
    ret = DB.validate(username=content['username'], 
                      password=content['password'])
    if not ret:
        return {'error':'invalid username/password combo'}
    else:
        return ret
def register_user(content):
    ret = DB.register_user(username=content['username'], 
                           password=content['password'])
    return ret
types = {'lookup_drug':{'required_fields':['drug_name'],
                   'function':lookup_drug},
         'drug_list':{'required_fields':[],
                      'function':drug_list},
         'drug_key_list':{'required_fields':[],
                          'function':drug_key_list},
         'save_drug_key':{'required_fields':['key','value'],
                          'function':save_drug_key},
         'new_drug':{'required_fields':[],
                     'function':new_drug},
         'modify_drug':{'required_fields':['mod_hash'],
                        'function':modify_drug},
         'login':{'required_fields':['username','password'],
                  'function':login},
         'register_user':{'required_fields':['username','password'],
                          'function':register_user},
         'user_list':{'required_fields':['username','mod_hash'],
                      'function':user_list},
         'save_drug':{'required_fields':['mod_hash',
                                         'brand_name',
                                         'generic_name',
                                         'how_supplied_storage_prior',
                                         'reconstitution_concentration',
                                         'stability_post_reconstruction',
                                         'vehicle_dilution',
                                         'administration',
                                         'misc_notes',
                                         'references',
                                         'black_box'],
                      'function':save_drug}}
        

application = webapp2.WSGIApplication([('/ajax.json', ajax),], debug=True)