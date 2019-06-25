import startCase from 'lodash.startcase'
import kebabCase from 'lodash.kebabcase'
import sidebar from '../sidebar'

export default class SidebarMenuHelper {
  static fillFilesArray(section, file, arr) {
    let folder = SidebarMenuHelper.getParentFolder(file, section)
    let filename = SidebarMenuHelper.extractFilename(file)
    let path = SidebarMenuHelper.getFullPath(folder, filename)
    arr[path] = startCase(
      SidebarMenuHelper.removeExtensionFromFileName(filename)
    )
  }

  static getZeroFile = arr => {
    if (typeof arr[0] !== 'string') {
      return arr[0].indexFile || arr[0]
    } else {
      this.getZeroFile(arr[0].files)
    }
  }

  static findFileByName = (item, find) => {
    let file = null
    if (
      (typeof item === 'string' && item.slice(0, -3) === find) ||
      (item.indexFile && item.indexFile.slice(0, -3) === find)
    ) {
      file = item
    } else if (item.name && kebabCase(item.name) === find) {
      file = item.files[0]
    }
    return file
  }

  //доделать!
  static getFile = (arr, find, x, callback) => {
    for (let i = 0; i < arr.length; i++) {
      let newfile = SidebarMenuHelper.findFileByName(arr[i], find)
      if (newfile) {
        callback(i)
        return newfile
      } else if (arr[i].files) {
        SidebarMenuHelper.getFile(arr[i].files, find, x, callback)
      }
    }
  }

  static getFileFromUrl = path => {
    let indexes = [],
      file = SidebarMenuHelper.getZeroFile(sidebar)
    for (let x = 2; x < path.length; x++) {
      file = SidebarMenuHelper.getFile(sidebar, path[x], x, i => {
        indexes.push(i)
      })
    }
    return {
      file: file,
      indexes: indexes
    }
  }

  static getName = (labels = null, folder = null, indexFile = null, names) => {
    let name
    if (labels && labels[indexFile]) {
      name = labels[indexFile]
    } else {
      let path = SidebarMenuHelper.getFullPath(folder, indexFile)
      name = names[path]
    }
    return name
  }

  static getNamesArr = json => {
    let arr = {}
    json.map(section => {
      section.files.map(file => {
        SidebarMenuHelper.fillFilesArray(section, file, arr)
        if (SidebarMenuHelper.hasChildrenFiles(file)) {
          file.files.map(subFile => {
            SidebarMenuHelper.fillFilesArray(section, subFile, arr)
          })
        }
      })
    })
    return arr
  }

  static convertToBooleanString(cond) {
    return (!!cond).toString()
  }

  static filesContains(array, folder, currentFile) {
    let flag = false
    array.forEach(elem => {
      let path = SidebarMenuHelper.getFullPath(folder, elem)
      if (path === currentFile) {
        flag = true
      }
    })
    return flag
  }

  static hasChildrenFiles(file) {
    return file.files && file.files.length > 0
  }

  static removeExtensionFromFileName(filename) {
    return filename
      .split('.')
      .slice(0, -1)
      .join('.')
  }

  static getFullPath(folder, file) {
    return `${folder}/${file}`
  }

  static extractFilename(file) {
    return typeof file === 'string' ? file : file.indexFile
  }

  static getParentFolder(file, section) {
    return file.folder ? file.folder : section.folder
  }
}
