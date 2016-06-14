"""

Helper file to manage translations for the Meerkat project

We have two types of translations, general and implementation specific

The general translations are extracted from the python, jijna2 and js files. 

The implementation specific text that needs to be translated is stored in a csv file. 

"""
 
from csv import DictReader
import argparse
import os
import shutil
import datetime
from babel.messages.pofile import read_po, write_po
from babel.messages.catalog import Catalog, Message
from babel._compat import BytesIO

parser = argparse.ArgumentParser()
parser.add_argument("action", choices=["update-po",
                                       "initialise",
                                       "insert-translations",
                                       "compile"
                                       ],
                    help="Choose action" )
parser.add_argument("-l", type=str,
                    help="Two letter langauge code")



def create_pot_file_csv(in_file, out_file):
    """
    Create a .po file from csv
    """
    with open(out_file, "wb") as out: 
        catalog = Catalog(project="Meerkat",
                          version="0.1",
                          copyright_holder="Meerkat Developers", 
                          charset="utf-8")

        with open(in_file, "r") as csv_file:
            csv = DictReader(csv_file)
            for line in csv:
                message = line["text"] #Message(line["text"])
                catalog.add(message, None, [(line["source"], 1)], context=None)
        write_po(out, catalog)

def find_languages(folders):
    """ Find the languages in the translations folders.
    Langauges are stored as subfolders with a two letter langauge code

    Args:
        folders: folders to loo through

    Returns: 
        langauges
    """
    languages = []
    for folder in folders:
        subfolder = os.listdir(folder)
        for potential_lang in subfolder:
            if len(potential_lang) == 2:
                languages.append(potential_lang)
    return languages

def insert_translation(pofile, csv_file, language):
    tmp_file = pofile + datetime.datetime.now().isoformat()
    shutil.copy(pofile, tmp_file)
    translation_dict = {}
    with open(csv_file, encoding="UTF-8") as csv_f:
        csv = DictReader(csv_f)
        if language not in csv.fieldnames:
            return
        for line in csv:
            if line["text"] and line[language]:
                translation_dict[line["text"]] = line[language]

    change = False
    with open(tmp_file) as original:
        catalog = read_po(original)
        for message in catalog:
            if message.string == "" and message.id in translation_dict:
                message.string = translation_dict[message.id]
                change = True
    if change:
        tmp_object = BytesIO()
        write_po(tmp_object, catalog)
        with open(pofile, "w") as out:
            out.write(tmp_object.getvalue().decode("utf8"))
        
    else:
        os.remove(tmp_file)



if __name__ == "__main__":

    args = parser.parse_args()
    implementation_dir = os.environ.get("COUNTRY_FOLDER", "country_config")
    implementation_csv = implementation_dir + "/translation.csv"

    if args.action == "update-po":
        shutil.copy("../meerkat_api/meerkat_api/resources/reports.py", "meerkat_frontend/reports.py")
        os.system("pybabel extract -F babel.cfg -o messages.pot .")
        os.system("pybabel update -i messages.pot -d translations")
        os.remove("meerkat_frontend/reports.py")
        tmp_file = implementation_dir + "/messages.pot"
        create_pot_file_csv(implementation_csv, tmp_file)
        os.system("pybabel update -i {} -d {}/translations".format(tmp_file, implementation_dir))
    elif args.action == "insert-translations":
        if args.l and len(args.l) == 2:
            insert_translation("{}/translations/{}/LC_MESSAGES/messages.po".format(implementation_dir, args.l), implementation_csv,args.l)
        else:
            print("Need to specify a two letter language code")
    elif args.action == "initialise":
        if args.l and len(args.l) == 2:
            #os.system("pybabel init -i messages.pot -d translations -l {}".format(args.l))
            os.system("pybabel init -i messages.pot -d {}/translations -l {}".format(implementation_dir,args.l))
        else:
            print("Need to specify a two letter language code")
    elif args.action == "compile":
        for lang in find_languages(["translations", "{}/translations".format(implementation_dir)]):
            os.system("msgcat --use-first -o meerkat_frontend/translations/{}/LC_MESSAGES/messages.po translations/{}/LC_MESSAGES/messages.po {}/translations/{}/LC_MESSAGES/messages.po".format(lang, lang, implementation_dir, lang))
        os.system("pybabel compile -d meerkat_frontend/translations")
        


