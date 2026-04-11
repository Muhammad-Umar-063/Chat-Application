import React, { useRef, useState } from 'react'
import { useChatStore } from '../hook/useChatStore'
import { X, Image, Send } from 'lucide-react'

const MsgInput = () => {

    const { sendMsg, selectedChatUser } = useChatStore()
    const [text, setText] = useState<string>("")
    const [previewImg, setPreviewImg] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = () => {
        setPreviewImg(reader.result as string)
      }
    }

    const handleSendMsg = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!selectedChatUser?._id) return
      if (!text.trim() && !previewImg) return

      await sendMsg(selectedChatUser._id, text.trim(), previewImg ?? undefined)
      setText("")
      setPreviewImg(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const removePreviewImg = () => {
      setPreviewImg(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }

  return (
 <div className="p-4 w-full">
      {previewImg && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={previewImg}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removePreviewImg}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMsg} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImgChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${previewImg ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !previewImg}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  )
}

export default MsgInput