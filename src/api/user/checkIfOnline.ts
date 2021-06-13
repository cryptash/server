import type { BaseServer } from '@logux/server'

const checkIfOnline = async (server: BaseServer, user_id: string) => {
  for (let client of server.connected.values()) {
    if (user_id === client.userId) return true
  }
  return false
}
export {checkIfOnline}