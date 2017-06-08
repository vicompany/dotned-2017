using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Threading;

using Orleans;

using Stock.Interfaces;

namespace Stock.Website.Models
{
    /// <summary>
    /// The socket handler.
    /// </summary>
    public class SocketHandler : IFundObserver
    {
        public List<WebSocket> WebSockets = new List<WebSocket>();

        public IFundObserver ObserverRef { get; set; }

        public SocketHandler()
        {
            var task = GrainClient.GrainFactory.CreateObjectReference<IFundObserver>(this);
            task.Wait();
            this.ObserverRef = task.Result;
        }

        public void AddSocket(WebSocket socket)
        {
            this.WebSockets.Add(socket);
        }

        public void SendMessage(string message)
        {
            foreach (var socket in this.WebSockets)
            {
                socket.SendAsync(
                    new ArraySegment<byte>(
                        Encoding.UTF8.GetBytes(message),
                        0,
                        message.Length),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None);
            }
        }

        internal void RemoveSocket(WebSocket socket)
        {
            this.WebSockets.Remove(socket);
        }
    }
}
