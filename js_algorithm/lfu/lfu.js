class LFU {
  constructor(maxKeyCount) {
    this.maxKeyCount = maxKeyCount;
    this.storeMap = new Map();
    this.countArr = []; // Array<Set> 结构，数组的index表示访问次数，Set是当前访问次数的key
  }

  get length() {
    return this.storeMap.size;
  }

  get(key) {
    if (!this.storeMap.has(key)) {
      return null;
    }
    const storeValue = this.storeMap.get(key);
    // 移除记录的Key
    this._removeKeyAtIndex(key, storeValue.count);
    // 访问次数加1
    storeValue.count++;
    // 重新记录访问的key
    this._addKeyAtIndex(key, storeValue.count);
    // 返回值
    return storeValue.value;
  }

  flush() {
    this.storeMap.clear();
    this.countArr.length = 0;
  }

  _removeKeyAtIndex(key, index) {
    const keySet = this.countArr[index];
    if (keySet && keySet.has(key)) {
      keySet.delete(key);
      this.countArr[index] = keySet;
    }
  }

  _addKeyAtIndex(key, index, isReplace) {
    const keySet = this.countArr[index] || new Set();
    if (keySet.has(key)) {
      keySet.delete(key);
    }
    if (!isReplace) {
      keySet.add(key);
    } else {
      this._addKeyAtIndex(key, index + 1);
    }
    this.countArr[index] = keySet;
  }

  put(key, value) {
    const hasKey = this.storeMap.has(key);
    let storeValue = { count: 0 };
    if (hasKey) {
      storeValue = this.storeMap.get(key);
    }
    storeValue.value = value;
    // 额度已满
    let deleteSucceed = true;
    if (!hasKey && this.length >= this.maxKeyCount) {
      deleteSucceed = this._deleteOld();
    }
    if (deleteSucceed) {
      this._addKeyAtIndex(key, storeValue.count, hasKey);
      this.storeMap.set(key, storeValue);
    }
  }

  /**
   * 删除访问次数最少的key
   */
  _deleteOld() {
    for (var i = 0, len = this.countArr.length; i < len; i++) {
      let keySet = this.countArr[i];
      if (keySet && keySet.size > 0) {
        const key = keySet.keys().next().value;
        this.storeMap.delete(key);
        this._removeKeyAtIndex(key, i);
        return true;
      }
    }
    return false;
  }
}

module.exports = LFU;
