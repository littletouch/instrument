import os

from qiniu import Auth, put_data

access_key = os.environ['QINIU_ACCESS']
secret_key = os.environ['QINIU_SECRET']

q = Auth(access_key, secret_key)

BUCKET_NAME = 'instrument'


def upload_data(key, data):
    token = q.upload_token(BUCKET_NAME, key, 3600)
    ret, info = put_data(token, key, data)
    try:
        assert ret['key'] == key
        return ret
    except:
        return None
