module.exports = `
.debug {
  position: fixed;
  top: 0;
  right: 2px;
  z-index: 1000;
}

.debug .trigger {
  height: 24px;
  font-size: 12px;
  box-sizing: border-box;
  cursor: pointer;
}

.modal .mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  height: 100%;
  background: rgba(0,0,0,0.5);
}

.modal .container {
  position: fixed;
  inset: 0;
  overflow: auto;
  outline: 0;
  z-index: 1000;
}

.modal .container .wrap {
  box-sizing: border-box;
  padding: 0 0 24px;
  position: relative;
  top: 100px;
  width: auto;
  max-width: calc(100vw - 32px);
  margin: 0 auto;
}

.content {
  background: white;
  border-radius: 2px;
  width: 520px;
  margin: 0 auto;
  font-size: 14px;
}

.content .header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  line-height: 36px;
  padding: 0 16px;
  border-bottom: 1px solid #ebebeb;
  box-sizing: border-box;
  font-weight: 500;
}

.content .button {
  height: 24px;
  font-size: 12px;
  box-sizing: border-box;
}

.content .remotes {
  padding: 8px 16px;
}

.content .remotes .remote {
  margin: 0 0 8px;
}

.content .remotes .remote .label {
  font-weight: bold;
}

.content .remotes .remote .value {
  width: 100%;
  font-size: 14px;
  box-sizing: border-box;
}

.content .remotes .remote .tip {
  color: #999;
}

.content .empty {
  height: 120px;
  line-height: 120px;
  color: #999;
  text-align: center;
}

.content .search {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px;
  background: #f5f5f5;
}

.content .search > input {
  width: 100%;
}

.content .footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  line-height: 36px;
  padding: 0 16px;
  border-top: 1px solid #ebebeb;
}

.content .footer .toolbar {
  color: #999;
}

.content .footer .actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0 8px;
}
`
