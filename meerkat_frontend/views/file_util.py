"""
explore.py

A Flask Blueprint module for the explore data page.
"""
from ..app import app
from functools import partial
from meerkat_frontend import auth
from flask import redirect, g, Blueprint, jsonify, current_app
from flask import make_response, request, abort
from io import BytesIO
import dropbox


dropbox_bp = Blueprint('dropbox_bp', __name__, url_prefix="/<language>")

def all_files(folder_name):
    ret = []
    for f in dbx.files_list_folder(base_folder + "/" + folder_name).entries:
        app.logger.info(f)
        ret.append({
            "name": f.name,
            "modified": f.server_modified,
            "path": f.path_lower
            })
    ret.sort(key=lambda x: x["modified"], reverse=True)
    for r in ret:
        r["modified"] = r["modified"].isoformat()
    return ret


def all_files_json(folder_name):
    return jsonify(all_files(folder_name))


def latest(folder_name):
    path = all_files(folder_name)[0]["path"]
    return redirect("/" + g.language + "/files/get?path={}".format(path))


@dropbox_bp.route('/get')
def get():
    if "path" in request.args:
        path = request.args["path"]
        try:
            md, data = dbx.files_download(path)
        except dropbox.exceptions.HttpError as err:
            abort(501, err)
        filename = path.split("/")[-1]
        output = make_response(data.content)
        output.headers["Content-Disposition"] = (
            "attachment; filename={}".format(filename)
        )
        content_types = {
            "csv": "text/csv",
            "pdf": "application/pdf",
            "html": "text/html",
            "txt": "text/txt"
            }
        output.headers["Content-type"] = content_types.get(
            filename.split(".")[-1],
            ""
        )
        return output
    else:
        abort(404)


if "DROPBOX" in app.config and app.config["DROPBOX"]:

    TOKEN = app.config["DROPBOX"]["TOKEN"]
    dbx = dropbox.Dropbox(TOKEN)
    base_folder = app.config["DROPBOX"]["base_folder"]
    app.logger.info(dbx.users_get_current_account())

    for folder in app.config["DROPBOX"]["folders"]:
        dropbox_bp.add_url_rule(
            '/{}/latest'.format(folder["url"]),
            folder["url"] + "_latest",
            partial(latest, folder["folder_name"])
        )
        dropbox_bp.add_url_rule(
            '/{}/all'.format(folder["url"]),
            folder["url"] + "_all",
            partial(all_files_json, folder["folder_name"])
        )
s3_files_bp = Blueprint('s3_file_bp', __name__, url_prefix="/<language>")
@s3_files_bp.before_request
def requires_auth():
    """
    Checks that the user has authenticated before returning any page from
    this Blueprint.
    """
    # We load the arguments for check_auth function from the config files.
    auth.check_auth(
        *current_app.config['AUTH'].get('technical', [['BROKEN'], ['']])
    )



s3_enabled = False
if "S3_FILES" in app.config and app.config["S3_FILES"]:
    import boto3
    import botocore
    s3 = boto3.client('s3')
    s3_enabled = True
    bucket = app.config["S3_FILES"]["bucket"]
import time
@s3_files_bp.route('/get')
def get():
    start = time.time()
    if not s3_enabled:
        abort(404)
    if "path" in request.args:
        path = request.args["path"]
        folder = path.split("/")[0]
        if folder in app.config["S3_FILES"]["folders"] and path:
            
            try:
                url = s3.generate_presigned_url(ClientMethod='get_object', Params={'Bucket': 'meerkat-somalia', 'Key': path}, ExpiresIn=3)

            except botocore.exceptions.ClientError:
                    abort(404)
            return redirect(url)
        else:
            abort(404)
    else:
        abort(404)
