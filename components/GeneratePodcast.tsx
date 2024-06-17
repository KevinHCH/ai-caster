"use client"
import { useState } from "react"
import { GeneratePodcastProps } from "@/types"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { Loader } from "lucide-react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { v4 as uuid } from "uuid"
import { useUploadFiles } from "@xixixao/uploadstuff/react"
import { useMutation } from "convex/react"
import { useToast } from "./ui/use-toast"

const useGeneratePodcast = ({
  setAudio,
  audio,
  setAudioStorageId,
  voicePrompt,
  setVoicePrompt,
  setAudioDuration,
  voiceType,
}: GeneratePodcastProps) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const getPodcastAudio = useAction(api.openai.generateAudioAction)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const { startUpload } = useUploadFiles(generateUploadUrl)
  const getAudioUrl = useMutation(api.podcasts.getUrl)

  const generatePodcast = async () => {
    setIsGenerating(true)
    setAudio("")
    if (!voicePrompt) {
      toast({
        title: "Please provide the text to generate audio",
      })
      setIsGenerating(false)
      return
    }
    try {
      const response = await getPodcastAudio({
        input: voicePrompt,
        voice: voiceType!,
      })
      const blob = new Blob([response], { type: "audio/mpeg" })
      const fileName = `podcast-${uuid()}.mp3`
      const file = new File([blob], fileName, { type: "audio/mpeg" })
      const uploaded = await startUpload([file])
      const storageId = (uploaded[0].response as any).storageId
      setAudioStorageId(storageId)
      const audioUrl = await getAudioUrl({ storageId })
      setAudio(audioUrl!)
      setIsGenerating(false)
      toast({
        title: "Podcast generated successfully",
      })
    } catch (error: any) {
      console.error(error.message)
      console.error("Failed to generate podcast")
      setIsGenerating(false)
      toast({
        title: "Error: Failed to generate podcast",
        variant: "destructive",
      })
    }
  }
  return {
    isGenerating,
    generatePodcast,
  }
}
const GeneratePodcast = ({
  voiceType,
  setAudio,
  audio,
  setAudioStorageId,
  voicePrompt,
  setVoicePrompt,
  setAudioDuration,
}: GeneratePodcastProps) => {
  const { isGenerating, generatePodcast } = useGeneratePodcast({
    voiceType,
    setAudio,
    audio,
    setAudioStorageId,
    voicePrompt,
    setVoicePrompt,
    setAudioDuration,
  })

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <Label className="text-16 font-bold text-white-1">
          AI prompt to generate the podcast
        </Label>
        <Textarea
          className="input-class font-light focus-visible:ring-orange-1"
          placeholder="Provide the text to generate audio"
          rows={5}
          value={voicePrompt}
          onChange={(e) => setVoicePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button
          type="button"
          className="text-16 bg-orange-1 py-4 font-extrabold text-white-1"
          onClick={generatePodcast}
        >
          {isGenerating ? (
            <>
              Generating
              <Loader size={20} className="animate-spin ml-2" />
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </div>

      {audio && (
        <audio
          controls
          src={audio}
          autoPlay
          className="mt-5"
          onLoadedMetadata={(e) => {
            setAudioDuration(e.currentTarget.duration)
          }}
        />
      )}
    </div>
  )
}

export default GeneratePodcast
