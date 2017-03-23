"""
explore.py

A Flask Blueprint module for the explore data page.
"""
from ..app import app
from flask import redirect, g, Blueprint, render_template, jsonify, current_app, make_response,request, Response, send_file, abort
import json
from .. import common as c
import authorise as auth
import dropbox
import io
from functools import partial


dropbox_bp = Blueprint('dropbox_bp', __name__, url_prefix="/<language>")


def all_files(folder_name):
    ret = []
    for f in dbx.files_list_folder(base_folder + "/" +folder_name).entries:
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
    return redirect("/" + g.language +"/files/get?path={}".format(path))
    


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
        output.headers["Content-Disposition"] = "attachment; filename={}".format(filename)
        content_types = {
            "csv": "text/csv",
            "pdf": "application/pdf",
            "html": "text/html"
            }
        output.headers["Content-type"] = content_types[filename.split(".")[-1]]
        return output
    else:
        abort(404)

    
if "DROPBOX" in app.config and app.config["DROPBOX"]:
    TOKEN = app.config["DROPBOX"]["TOKEN"]
    dbx = dropbox.Dropbox(TOKEN)
    base_folder = app.config["DROPBOX"]["base_folder"]
    
    app.logger.info(dbx.users_get_current_account())
    for folder in app.config["DROPBOX"]["folders"]:
        dropbox_bp.add_url_rule('/{}/latest'.format(folder["url"]),
                                folder["url"] + "_latest", partial(latest, folder["folder_name"]))
        dropbox_bp.add_url_rule('/{}/all'.format(folder["url"]),
                                folder["url"] + "_all", partial(all_files_json, folder["folder_name"]))



