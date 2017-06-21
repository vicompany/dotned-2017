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
        private readonly List<WebSocket> webSockets = new List<WebSocket>();

        public SocketHandler()
        {
            var task = GrainClient.GrainFactory.CreateObjectReference<IFundObserver>(this);
            task.Wait();
            this.ObserverRef = task.Result;
        }

        public IFundObserver ObserverRef { get; set; }

        public void AddSocket(WebSocket socket)
        {
            this.webSockets.Add(socket);
        }

        public void SendMessage(string message)
        {
            try
            {
                foreach (var socket in this.webSockets)
                {
                    socket.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(message), 0, message.Length), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
            catch (Exception)
            {
                // Eat this exception and swallow it whole
            }
        }

        internal void RemoveSocket(WebSocket socket)
        {
            this.webSockets.Remove(socket);
        }
    }
}
