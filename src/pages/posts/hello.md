---
layout: ../../layouts/Post.astro

unique_id: 32595503-C0ED-4D35-9E7A-838476F6E74E
short_id: next-level-playground

title: UDP Multicast in Rust
description: >
    I don't have a clue how UDP multicast works, I'll try to make it works lets
    see what happens.
pub_date: 2022-11-17T00:00:00Z
tags: ["react"]
---

# UDP Multicast in Rust

I don't have a clue how multicast works, this time I'll try to do it in Rust.

```rust
const RECV_BUFFER_SIZE: usize = 64 * 1024;

#[tokio::main]
async fn main() -> io::Result<()> {
    let mut buf = [0; RECV_BUFFER_SIZE];
    let sock = UdpSocket::bind("0.0.0.0:8080").await?;
    loop {
        let (len, addr) = sock.recv_from(&mut buf).await?;
        println!("{:?} bytes received from {:?}", len, addr);

        let len = sock.send_to(&buf[..len], addr).await?;
        println!("{:?} bytes sent", len);
    }
}
```
