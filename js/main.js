var before = document.getElementById('id-before');
var after = document.getElementById('id-after');
var resultContainer = document.getElementById('id-result-container');
var showPreviewButton = document.getElementById('id-show-preview');
var actions = document.getElementById('actions');
var selectAllButton = document.getElementById('id-select-all');
var deselectAllButton = document.getElementById('id-deselect-all');
var startReplaceButton = document.getElementById('id-start-replace');
var foundNum = document.getElementById('id-found-num');
var selectedNum = document.getElementById('id-selected-num');

var willChangeMap = {};

function search() {
  willChangeMap = {};
  var beforeValue = before.value;
  var afterValue = after.value;
  if (beforeValue) {
    chrome.bookmarks.search(beforeValue, function (res) {
      var result = res.filter(function (item) {
        return item.url.includes(beforeValue);
      });
      foundNum.innerText = result.length;
      selectedNum.innerText = 0;
      renderResult(result, beforeValue, afterValue);
    });
  } else {
    alert('please input something in the first input');
  }
}

showPreviewButton.onclick = search;

function highlight(url, word) {
  if (!word) {
    return url;
  }
  var arr = url.split(word);
  var j = `<span class="highlight">${word}</span>`;
  var r = arr.join(j);
  return r;
}

function templateCell(obj, beforeValue, afterValue) {
  var afterURL = obj.url.replace(new RegExp(beforeValue, 'gm'), afterValue);
  willChangeMap[obj.id] = afterURL;
  return `<tr>
    <td>
      <input type="checkbox" name="id" value="${obj.id}" />
    </td>
    <td>
      <div><b>title</b>: ${obj.title}</div>
      <div><b>before</b>: ${highlight(obj.url, beforeValue)}</div>
      <div><b>after</b>: ${highlight(afterURL, afterValue)}</div>
    </td>
  </tr>`;
}

function renderResult(res, beforeValue, afterValue) {
  var html = res.reduce(function (pre, cur) {
    return pre + templateCell(cur, beforeValue, afterValue);
  }, '');
  resultContainer.innerHTML = html;
}

function selectOrDeselectAllCheckbox(bool) {
  document
    .querySelectorAll('input[type=checkbox][name=id]')
    .forEach(function (item) {
      item.checked = bool;
    });
  selectedNum.innerText = getChecked().length;
}

selectAllButton.onclick = function () {
  selectOrDeselectAllCheckbox(true);
};

deselectAllButton.onclick = function () {
  selectOrDeselectAllCheckbox(false);
};

function getChecked() {
  return document.querySelectorAll('input[type="checkbox"]:checked');
}

startReplaceButton.onclick = function () {
  var checked = getChecked();
  if (!checked.length) {
    alert('please select at least one item');
  } else if (confirm("are you sure? This action can't be undone.")) {
    var checkedId = Array.prototype.map.call(checked, function (item) {
      return item.value;
    });
    checkedId.forEach(function (id) {
      chrome.bookmarks.update(id, { url: willChangeMap[id] });
    });
    alert('success!');
  }
};

resultContainer.onclick = function (e) {
  if (e.target.nodeName === 'INPUT') {
    selectedNum.innerText = getChecked().length;
  }
};
