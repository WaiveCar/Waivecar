# This is copied from the app/tools/common.sh
nvmcheck() {
  which node > /dev/null
  if [ ! $? ]; then
    version=`node --version`
    [ "$version" == "v4.2.6" ] && return
  fi
  . "$HOME/.nvm/nvm.sh"
}
