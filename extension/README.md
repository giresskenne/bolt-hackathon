# privly.extension

Important NoteExtension
To pack extension either for local testing or production (chrome store)
* Get into the extension directory
* Run npm run build, to build the web pack
    run these is any error
    npm i -D terser-webpack-plugin        # minifier
    npm i -D babel-plugin-transform-remove-console  # (optional) finer-grained control
    npm i -D @babel/preset-env            # you probably want this anyway

    * This will generate the dist directory, this is the directory to pack as a zip file or to load as unpacked extension when testing locally



