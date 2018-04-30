## Configuration

### Internationalization

All messages in *Simple Directory* are externalized and internationalized.

To add a language you can add a file in [this directory ]((https://github.com/koumoul-dev/simple-directory/tree/master/i18n)) either by overwriting the Docker image or submitting a pull request.

To change some values you can set environment variables when running the service. The table below contains the supported keys. **Warning:** we try to keep the keys as stables as possible, but still some modification may occur between 2 versions of *Simple Directory*. If you overwrite some values, you should check it again after each upgrade.

{{I18N_VARS}}
