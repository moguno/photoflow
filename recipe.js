const recipe = [
  // ファイル名に撮影時刻を付与
  {
    plugin: "rename-exif-creation-date",
    params: {
      newName: "%(year)d%(month)02d%(day)02d_%(hour)02d%(minute)02d%(second)02d"
    }
  },
  // ファイル名にMD5値を付与
  {
    plugin: "rename-md5",
    params: {
      newName: "%(originalFilename)s_%(lowerCase)s"
    }
  },
  // 撮影時刻に従ってフォルダ分け
  {
    plugin: "move-exif-creation-date",
    params: {
      newName: "%(year)d/%(year)d%(month)02d%(day)02d"
    }
  },
  // 拡張子を小文字に
  {
    plugin: "extension",
    params: {
      lowerCase: true
    }
  },
]

exports.recipe = recipe